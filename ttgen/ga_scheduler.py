from .models import Batch, Section, Subject, Teacher, Classroom, TimetableEntry
import random
import sys

DAYS = [0, 1, 2, 3, 4]  # Monday to Friday
# Define period timings for 1.5-hour slots
PERIOD_TIMINGS = {
    1: "08:00–09:30",
    2: "09:30–11:00",
    3: "11:00–12:30",
    4: "12:30–14:00",
    5: "14:00–15:30",
    6: "15:30–17:00",
}
PERIODS = [1, 2, 3, 4, 5, 6]  # Allow periods 1-6 for class assignment
MAX_GENERATIONS = 100
POPULATION_SIZE = 50
EARLY_STOPPING_PATIENCE = 20

# Helper: get all data


def get_all_data():
    return {
        'sections': list(Section.objects.all()),
        'subjects': list(Subject.objects.all()),
        'teachers': list(Teacher.objects.all()),
        'classrooms': list(Classroom.objects.all()),
    }


def get_all_sections_data():
    sections = list(Section.objects.all())
    subjects = list(Subject.objects.all())
    teachers = list(Teacher.objects.all())
    classrooms = list(Classroom.objects.all())
    return {
        'sections': sections,
        'subjects': subjects,
        'teachers': teachers,
        'classrooms': classrooms,
    }


def get_all_batches_data():
    batches = list(Batch.objects.all())
    print(f"[DEBUG] Fetched batches: {[b.name for b in batches]}")
    batch_data = {}
    for batch in batches:
        sections = list(Section.objects.filter(batch=batch))
        subjects = list(Subject.objects.filter(batches=batch))
        teachers = list(Teacher.objects.filter(batches=batch))
        classrooms = list(Classroom.objects.all())
        print(f"[DEBUG] Batch {batch.name}: sections={len(sections)}, subjects={len(subjects)}, teachers={len(teachers)}")
        batch_data[batch.id] = {
            'batch': batch,
            'sections': sections,
            'subjects': subjects,
            'teachers': teachers,
            'classrooms': classrooms,
        }
    return batch_data


# Helper: get data for a specific batch and section
def get_batch_section_data(batch_id):
    sections = list(Section.objects.filter(batch_id=batch_id))
    subjects = list(Subject.objects.filter(batches=batch_id))
    teachers = list(Teacher.objects.filter(batches=batch_id))
    classrooms = list(Classroom.objects.all())
    return {
        'sections': sections,
        'subjects': subjects,
        'teachers': teachers,
        'classrooms': classrooms,
    }


# Helper: get teachers for a subject
def teachers_for_subject(subject, teachers):
    return [t for t in teachers if subject in t.subjects.all()]


# Chromosome: timetable for all sections
class Chromosome:
    def __init__(self, data):
        self.data = data
        self.genes = {}  # (section_id, day, period): (subject_id, teacher_id)
        self.fitness = None
        self._build_random()

    def _build_random(self):
        self.genes = {}
        sections = self.data['sections']
        # Use global constants for days and periods
        days = DAYS
        periods = PERIODS
        classrooms = self.data['classrooms']

        for section in sections:
            section_id = section.id
            subjects = self.data['subjects']
            subject_periods = {subj: getattr(subj, 'periods_per_week', 2) or 2 for subj in subjects}
            assigned_slots = set()
            for subject, required_periods in subject_periods.items():
                count = 0
                attempt = 0
                max_attempts = 1000
                while count < required_periods and attempt < max_attempts:
                    attempt += 1
                    day = random.choice(days)
                    period = random.choice(periods)
                    slot_key = (section_id, day, period)
                    if slot_key in self.genes or slot_key in assigned_slots:
                        continue
                    # Get valid teachers for this subject
                    teachers = [t for t in self.data['teachers'] if subject in t.subjects.all()]
                    if not teachers:
                        continue
                    teacher = random.choice(teachers)
                    # Assign classroom based on subject type
                    if 'lab' in subject.name.lower():
                        lab_rooms = [c for c in classrooms if c.type == 'lab']
                        if not lab_rooms:
                            continue  # or handle missing lab room case
                        room = random.choice(lab_rooms)
                    else:
                        regular_rooms = [c for c in classrooms if c.type == 'regular']
                        if not regular_rooms:
                            continue  # or handle missing regular room case
                        room = random.choice(regular_rooms)
                    # Check conflicts with all existing genes
                    conflict = False
                    for (sec_id, d, p), entry in self.genes.items():
                        if d == day and p == period:
                            if entry['teacher'] == teacher or entry['room'] == room or entry['subject'] == subject:
                                conflict = True
                                break
                    if not conflict:
                        self.genes[slot_key] = {
                            'subject': subject,
                            'teacher': teacher,
                            'room': room
                        }
                        assigned_slots.add(slot_key)
                        count += 1
                if attempt >= max_attempts:
                    print(f"[WARNING] Could not assign all periods for subject {subject} in section {section_id}")

        # Diagnostic log: check if SEC A and SEC B have the same time slot keys
        sec_a_keys = sorted([k for k in self.genes if (isinstance(k[0], str) and k[0] == 'SEC A') or (hasattr(k[0], 'name') and getattr(k[0], 'name', None) == 'SEC A')])
        sec_b_keys = sorted([k for k in self.genes if (isinstance(k[0], str) and k[0] == 'SEC B') or (hasattr(k[0], 'name') and getattr(k[0], 'name', None) == 'SEC B')])
        if sec_a_keys and sec_b_keys and sec_a_keys == sec_b_keys:
            print("⚠️ Warning: SEC A and SEC B have same time slot keys!")

    def calc_fitness(self):
        teacher_periods = {}  # (teacher_id, day, period): count
        teacher_load = {}    # teacher_id: count
        section_slots = set()
        penalty = 0

        for (section_id, day, period), gene in self.genes.items():
            if isinstance(gene, dict):
                subject_id = gene['subject'].id if hasattr(gene['subject'], 'id') else gene['subject']
                teacher_id = gene['teacher'].id if hasattr(gene['teacher'], 'id') else gene['teacher']
                classroom_id = gene['room'].id if hasattr(gene['room'], 'id') else gene['room']
            else:
                subject_id, teacher_id, classroom_id = gene

            key = (teacher_id, day, period)
            if key in teacher_periods:
                penalty += 10
            else:
                teacher_periods[key] = 1

            teacher_load[teacher_id] = teacher_load.get(teacher_id, 0) + 1

            slot_key = (section_id, day, period)
            if slot_key in section_slots:
                penalty += 10
            else:
                section_slots.add(slot_key)

        for teacher in self.data['teachers']:
            if teacher_load.get(teacher.id, 0) > teacher.max_periods_per_week:
                penalty += 10 * (teacher_load[teacher.id] - teacher.max_periods_per_week)

        # --- Soft Constraints ---

        # 1. Avoid more than 2 hard subjects in a row
        for section in self.data['sections']:
            for day in DAYS:
                hard_count = 0
                for period in PERIODS:
                    gene = self.genes.get((section.id, day, period))
                    if gene:
                        if isinstance(gene, dict):
                            subject = gene['subject']
                        else:
                            subject = next((s for s in self.data['subjects'] if s.id == gene[0]), None)
                        if subject and any(h in subject.name.lower() for h in ['math', 'phys', 'chem']):
                            hard_count += 1
                            if hard_count > 2:
                                penalty += 2
                        else:
                            hard_count = 0

        # 2. Spread subjects evenly
        for section in self.data['sections']:
            subject_counts = {}
            for day in DAYS:
                for period in PERIODS:
                    gene = self.genes.get((section.id, day, period))
                    if gene:
                        subject_id = gene['subject'].id if isinstance(gene, dict) else gene[0]
                        subject_counts[subject_id] = subject_counts.get(subject_id, 0) + 1
            if subject_counts:
                max_count = max(subject_counts.values())
                min_count = min(subject_counts.values())
                if max_count - min_count > 2:
                    penalty += (max_count - min_count)

        # ✅ 3. Penalize idle gaps for sections
        for section in self.data['sections']:
            for day in DAYS:
                active_periods = sorted(p for p in PERIODS if (section.id, day, p) in self.genes)
                for i in range(1, len(active_periods)):
                    gap = active_periods[i] - active_periods[i - 1] - 1
                    if gap > 0:
                        penalty += gap * 2  # Strong penalty for student idle time

        # ✅ 4. Penalize idle gaps for teachers
        for teacher in self.data['teachers']:
            for day in DAYS:
                active_periods = sorted(
                    p for (sec_id, d, p), gene in self.genes.items()
                    if d == day and (
                        isinstance(gene, dict) and gene['teacher'].id == teacher.id or
                        isinstance(gene, tuple) and gene[1] == teacher.id
                    )
                )
                for i in range(1, len(active_periods)):
                    gap = active_periods[i] - active_periods[i - 1] - 1
                    if gap > 0:
                        penalty += gap  # Lighter penalty for teacher idle time

        # 5. Classroom conflicts
        classroom_periods = {}
        for (section_id, day, period), gene in self.genes.items():
            classroom_id = gene['room'].id if isinstance(gene, dict) else gene[2]
            if classroom_id:
                key = (classroom_id, day, period)
                if key in classroom_periods:
                    penalty += 10
                else:
                    classroom_periods[key] = 1

        # 6. Penalize duplicate section timetables
        section_timetables = {}
        for section in self.data['sections']:
            timetable = {}
            for day in DAYS:
                for period in PERIODS:
                    gene = self.genes.get((section.id, day, period))
                    if gene:
                        if isinstance(gene, dict):
                            timetable[(day, period)] = (
                                gene['subject'], gene['teacher'], gene['room']
                            )
                        else:
                            timetable[(day, period)] = gene
            section_timetables[section.id] = timetable

        seen = set()
        for section_id, timetable in section_timetables.items():
            signature = (section_id, tuple(sorted(timetable.items())))
            if signature in seen:
                penalty += 1_000_000
            else:
                seen.add(signature)

        # 7. Penalize same timetable for SEC A and B
        section_ids = [s.id for s in self.data['sections']]
        if len(section_ids) >= 2:
            for i in range(len(section_ids)):
                for j in range(i + 1, len(section_ids)):
                    a_timetable = {
                        (d, p): v for (sec, d, p), v in self.genes.items() if sec == section_ids[i]
                    }
                    b_timetable = {
                        (d, p): v for (sec, d, p), v in self.genes.items() if sec == section_ids[j]
                    }
                    if a_timetable == b_timetable:
                        penalty += 10_000

        self.fitness = -penalty
        return self.fitness

    def copy(self):
        c = Chromosome(self.data)
        c.genes = self.genes.copy()
        c.fitness = self.fitness
        return c

    def mutate(self, mutation_rate=0.1):
        """
        For each slot, with probability mutation_rate, reassign teacher and room, ensuring no conflicts with other sections at the same time.
        Uses self.data to select valid teachers and rooms.
        """
        for key in list(self.genes.keys()):
            if random.random() < mutation_rate:
                section_id, day, period = key
                subject_id, old_teacher_id, old_room_id = self.genes[key]
                # Get valid teachers for this subject
                valid_teachers = [t for t in self.data['teachers'] if subject_id in [s.id for s in t.subjects.all()]]
                if not valid_teachers:
                    continue
                teacher = random.choice(valid_teachers)
                room = random.choice(self.data['classrooms'])
                # Check for conflicts before assigning
                conflict = False
                for (sec_id, d, p), (subj, tchr, rm) in self.genes.items():
                    if d == day and p == period and sec_id != section_id:
                        if tchr == teacher.id or rm == room.id or subj == subject_id:
                            conflict = True
                            break
                if not conflict:
                    self.genes[key] = (subject_id, teacher.id, room.id)

    def crossover(self, other):
        """
        Slot-level crossover: For each section and each (day, period), randomly pick the gene (subject, teacher, room) from either parent.
        Ensures each section's timetable is a new mix and avoids duplicate section timetables in the child.
        """
        child = Chromosome(self.data)
        child.genes = {}

        section_ids = [s.id for s in self.data['sections']]
        section_signatures = set()
        for section_id in section_ids:
            time_slots = set()
            for (sec_id, day, period) in self.genes:
                if sec_id == section_id:
                    time_slots.add((day, period))
            for (sec_id, day, period) in other.genes:
                if sec_id == section_id:
                    time_slots.add((day, period))

            for (day, period) in time_slots:
                parent = self if random.random() < 0.5 else other
                if (section_id, day, period) in parent.genes:
                    gene = parent.genes[(section_id, day, period)]
                    child.genes[(section_id, day, period)] = gene
            # Uniqueness check: penalize if this section's timetable matches any previous in the child
            timetable = {(day, period): child.genes[(section_id, day, period)] for (sec_id, day, period) in child.genes if sec_id == section_id}
            signature = (section_id, tuple(sorted(timetable.items())))
            if signature in section_signatures:
                # If duplicate, force a mutation for this section
                child.mutate()
            section_signatures.add(signature)
        return child

# GA main
def generate_timetable(batch_id):
    try:
        data = get_batch_section_data(batch_id)
        print(f"[DEBUG] Data for batch {batch_id}: sections={len(data['sections'])}, subjects={len(data['subjects'])}, teachers={len(data['teachers'])}, classrooms={len(data['classrooms'])}")
        sys.stdout.flush()
        if not data['sections']:
            print(f"[ERROR] No sections found for batch {batch_id}")
            return {'success': False, 'error': 'No sections found'}
        if not data['subjects']:
            print(f"[ERROR] No subjects found for batch {batch_id}")
            return {'success': False, 'error': 'No subjects found'}
        if not data['teachers']:
            print(f"[ERROR] No teachers found for batch {batch_id}")
            return {'success': False, 'error': 'No teachers found'}
        TimetableEntry.objects.filter(section__batch_id=batch_id).delete()
        print(f"GA: {len(data['sections'])} sections, {len(data['subjects'])} subjects, {len(data['teachers'])} teachers.")
        sys.stdout.flush()
        # Population init
        population = [Chromosome(data) for _ in range(POPULATION_SIZE)]
        for chrom in population:
            chrom.calc_fitness()
        best = max(population, key=lambda c: c.fitness)
        for generation in range(1, MAX_GENERATIONS + 1):
            print(f"[GA] Starting timetable generation for batch {batch_id}")
            sys.stdout.flush()
            # Selection (tournament)
            new_pop = []
            for _ in range(POPULATION_SIZE):
                a, b = random.sample(population, 2)
                winner = a if a.fitness > b.fitness else b
                new_pop.append(winner.copy())
            # Mutation: randomly reassign a slot and mutate a whole section
            for chrom in new_pop:
                if random.random() < 0.2:
                    if chrom.genes:
                        slot = random.choice(list(chrom.genes.keys()))
                        subject_id, teacher_id, classroom_id = chrom.genes[slot]
                        subject = next((s for s in data['subjects'] if s.id == subject_id), None)
                        if subject:
                            teachers = teachers_for_subject(subject, data['teachers'])
                            if teachers:
                                chrom.genes[slot] = (subject_id, random.choice(teachers).id, classroom_id)
                    # --- New: Mutate an entire section ---
                    section_ids = [s.id for s in data['sections']]
                    if section_ids:
                        section_to_mutate = random.choice(section_ids)
                        # Remove all genes for this section
                        keys_to_remove = [k for k in chrom.genes if k[0] == section_to_mutate]
                        for k in keys_to_remove:
                            del chrom.genes[k]
                        # Rebuild this section's timetable with new randomization
                        subjects = data['subjects']
                        subject_periods = {subj: getattr(subj, 'periods_per_week', 2) or 2 for subj in subjects}
                        available_slots = [(d, p) for d in DAYS for p in PERIODS]
                        random.shuffle(available_slots)
                        for subject in subjects:
                            periods_needed = subject_periods[subject.id]
                            available_teachers = teachers_for_subject(subject, data['teachers'])
                            random.shuffle(available_teachers)
                            assigned_periods = 0
                            attempts = 0
                            max_attempts = 100
                            while assigned_periods < periods_needed and attempts < max_attempts:
                                attempts += 1
                                found = False
                                for day, period in available_slots:
                                    if (section_to_mutate, day, period) in chrom.genes:
                                        continue
                                    teacher = random.choice(available_teachers) if available_teachers else None
                                    if not teacher:
                                        continue
                                    classroom = None
                                    possible_classrooms = []
                                    if 'lab' in subject.name.lower():
                                        possible_classrooms = [c for c in data['classrooms'] if c.type == 'lab']
                                    if not possible_classrooms:
                                        possible_classrooms = [c for c in data['classrooms'] if c.type == 'regular']
                                    if not possible_classrooms:
                                        possible_classrooms = list(data['classrooms'])
                                    random.shuffle(possible_classrooms)
                                    for c in possible_classrooms:
                                        classroom = c
                                        break
                                    if not classroom:
                                        continue
                                    chrom.genes[(section_to_mutate, day, period)] = (subject.id, teacher.id, classroom.id)
                                    assigned_periods += 1
                                    found = True
                                    break
                                if found:
                                    continue
                chrom.calc_fitness()
            # After mutation, ensure no two sections have identical timetables (large penalty in fitness)
            population = new_pop
            best = max(population, key=lambda c: c.fitness)
            print(f"[GA] Generation {generation}/{MAX_GENERATIONS} - Best fitness: {best.fitness}")
            sys.stdout.flush()
        print(f"[GA] Finished timetable generation for batch {batch_id} after {MAX_GENERATIONS} generations.")
        sys.stdout.flush()
        # Save best timetable
        for (section_id, day, period), (subject_id, teacher_id, classroom_id) in best.genes.items():
            # Support both tuple and dict gene formats
            gene = best.genes[(section_id, day, period)]
            if isinstance(gene, dict):
                subject_val = gene['subject'].id if hasattr(gene['subject'], 'id') else gene['subject']
                teacher_val = gene['teacher'].id if hasattr(gene['teacher'], 'id') else gene['teacher']
                room_val = gene['room'].id if hasattr(gene['room'], 'id') else gene['room']
            else:
                subject_val, teacher_val, room_val = gene
            obj = TimetableEntry.objects.create(
                section_id=section_id,
                subject_id=subject_val,
                teacher_id=teacher_val,
                classroom_id=room_val,
                day=day,
                period=period
            )
            print(f"[DEBUG] Saved TimetableEntry: id={obj.id}, section={section_id}, subject={subject_val}, teacher={teacher_val}, classroom={room_val}, day={day}, period={period}")
            sys.stdout.flush()
        print(f"Created {len(best.genes)} timetable entries.")
        sys.stdout.flush()
        for section in data['sections']:
            check_timetable_conflicts(section.id)
        return {'success': True}
    except Exception as e:
        print(f"[EXCEPTION] Error in generate_timetable: {e}")
        import traceback
        traceback.print_exc()
        sys.stdout.flush()
        return {'success': False, 'error': str(e)}


def check_timetable_conflicts(section_id):
    entries = TimetableEntry.objects.filter(section_id=section_id)
    teacher_periods = set()
    classroom_periods = set()
    errors = []
    for e in entries:
        t_key = (e.teacher_id, e.day, e.period)
        c_key = (e.classroom_id, e.day, e.period)
        if t_key in teacher_periods:
            errors.append(f"[CONFLICT] Teacher {e.teacher.name} double-booked on {e.get_day_display()} period {e.period}")
        else:
            teacher_periods.add(t_key)
        if e.classroom_id and c_key in classroom_periods:
            errors.append(f"[CONFLICT] Classroom {e.classroom.name} double-booked on {e.get_day_display()} period {e.period}")
        else:
            classroom_periods.add(c_key)
        if e.subject not in e.teacher.subjects.all():
            errors.append(f"[CONFLICT] Teacher {e.teacher.name} assigned to unassigned subject {e.subject.name} in section {e.section.name}")
    if errors:
        print(f"[CONFLICTS FOUND] Section {entries[0].section.name if entries else section_id}:")
        for err in errors:
            print(err)
    else:
        print(f"[NO CONFLICTS] Section {entries[0].section.name if entries else section_id}")
    import sys
    sys.stdout.flush()


def generate_timetables_for_all_batches():
    print("[DEBUG] Generating timetables for all batches with global conflict checks.")
    sys.stdout.flush()
    try:
        batch_data = get_all_batches_data()
        TimetableEntry.objects.all().delete()
        print("[DEBUG] Deleted all previous timetable entries.")
        sys.stdout.flush()
        result = []
        global_teacher_periods = set()  # (teacher_id, day, period)
        global_classroom_periods = set()  # (classroom_id, day, period)
        for batch_id, data in batch_data.items():
            print(f"\n[SUMMARY] Batch: {data['batch'].name}")
            print(f"  Sections: {len(data['sections'])}")
            print(f"  Subjects: {len(data['subjects'])}")
            print(f"  Teachers: {len(data['teachers'])}")
            print(f"  Classrooms: {len(data['classrooms'])}")
            total_slots = len(data['sections']) * len(PERIODS) * len(DAYS)
            total_needed = sum(getattr(s, 'periods_per_week', 2) or 2 for s in data['subjects'])
            print(f"  Available slots per batch: {total_slots}")
            print(f"  Needed subject periods: {total_needed}")
            if total_needed > total_slots:
                print(f"[ERROR] Not enough slots for all subjects in batch {data['batch'].name}. Needed: {total_needed}, Available: {total_slots}")
                continue
            sys.stdout.flush()
            print(f"[DEBUG] Generating for batch {data['batch'].name}")
            sys.stdout.flush()
            population = [Chromosome(data) for _ in range(POPULATION_SIZE)]
            for chrom in population:
                chrom.calc_fitness()
            best = max(population, key=lambda c: c.fitness)
            best_fitness = best.fitness
            stagnant = 0
            for generation in range(1, MAX_GENERATIONS + 1):
                print(f"[GA] Starting timetable generation for batch {batch_id}")
                sys.stdout.flush()
                # Selection (tournament)
                new_pop = []
                for _ in range(POPULATION_SIZE):
                    a, b = random.sample(population, 2)
                    winner = a if a.fitness > b.fitness else b
                    child = winner.copy()
                    if random.random() < 0.2 and child.genes:
                        slot = random.choice(list(child.genes.keys()))
                        subject_id, teacher_id, classroom_id = child.genes[slot]
                        subject = next((s for s in data['subjects'] if s.id == subject_id), None)
                        if subject:
                            teachers = teachers_for_subject(subject, data['teachers'])
                            if teachers:
                                child.genes[slot] = (subject_id, random.choice(teachers).id, classroom_id)
                    child.calc_fitness()
                    new_pop.append(child)
                population = new_pop
                best = max(population, key=lambda c: c.fitness)
                if best.fitness == best_fitness:
                    stagnant += 1
                else:
                    stagnant = 0
                    best_fitness = best.fitness
                if stagnant >= EARLY_STOPPING_PATIENCE:
                    print(f"[DEBUG] Early stopping at generation {generation} due to no improvement.")
                    break
                print(f"[GA] Generation {generation}/{MAX_GENERATIONS} - Best fitness: {best.fitness}")
                sys.stdout.flush()
            print(f"[GA] Finished timetable generation for batch {batch_id} after {MAX_GENERATIONS} generations.")
            sys.stdout.flush()
            print(f"[DEBUG] Saving timetable entries for batch {data['batch'].name}.")
            sys.stdout.flush()
            batch = data['batch']
            for (section_id, day, period), (subject_id, teacher_id, classroom_id) in best.genes.items():
                # Global teacher and classroom conflict check
                if (teacher_id, day, period) in global_teacher_periods:
                    print(f"[CONFLICT] Teacher {teacher_id} already assigned on day {day} period {period}, skipping entry.")
                    continue
                if classroom_id and (classroom_id, day, period) in global_classroom_periods:
                    print(f"[CONFLICT] Classroom {classroom_id} already assigned on day {day} period {period}, skipping entry.")
                    continue
                if (section_id, day, period) in best.genes:
                    gene = best.genes[(section_id, day, period)]
                    if isinstance(gene, dict):
                        subject_val = gene['subject'].id if hasattr(gene['subject'], 'id') else gene['subject']
                        teacher_val = gene['teacher'].id if hasattr(gene['teacher'], 'id') else gene['teacher']
                        room_val = gene['room'].id if hasattr(gene['room'], 'id') else gene['room']
                    else:
                        subject_val, teacher_val, room_val = gene
                    if (teacher_val, day, period) in global_teacher_periods:
                        continue
                    if room_val and (room_val, day, period) in global_classroom_periods:
                        continue
                    obj = TimetableEntry.objects.create(
                        section_id=section_id,
                        subject_id=subject_val,
                        teacher_id=teacher_val,
                        classroom_id=room_val,
                        day=day,
                        period=period
                    )
                    print(f"[DEBUG] Saved TimetableEntry: id={obj.id}, section={section_id}, subject={subject_val}, teacher={teacher_val}, classroom={room_val}, day={day}, period={period}")
                    sys.stdout.flush()
            # Display the timetable for this batch
            print(f"\n[Timetable for Batch: {batch.name}]")
            for sec in data['sections']:
                print(f"Section: {sec.name}")
                entries = TimetableEntry.objects.filter(section=sec).order_by('day', 'period')
                for e in entries:
                    print(f"  Day {e.get_day_display()} Period {e.period} ({PERIOD_TIMINGS.get(e.period, '')}): {e.subject.name} - {e.teacher.name} - {e.classroom.name if e.classroom else ''}")
                # --- NEW: Append one result per section ---
                result.append({
                    'batch_name': batch.name,
                    'section_name': sec.name,
                    'entries': [
                        {
                            'section': e.section.name,
                            'day': e.day,
                            'period': e.period,
                            'time': PERIOD_TIMINGS.get(e.period, ''),
                            'subject': e.subject.name,
                            'teacher': e.teacher.name,
                            'classroom': e.classroom.name if e.classroom else '',
                            'subject_code': getattr(e.subject, 'code', ''),
                        }
                        for e in entries
                    ]
                })
        print("\n[All Batch Timetables]")
        for batch in result:
            print(f"\nBatch: {batch['batch_name']} - Section: {batch.get('section_name', '')}")
            for entry in batch['entries']:
                print(f"  Section: {entry['section']} | Day: {entry['day']} | Period: {entry['period']} | Time: {entry['time']} | Subject: {entry['subject']} | Teacher: {entry['teacher']} | Room: {entry['classroom']}")
        sys.stdout.flush()
        return result
    except Exception as e:
        print(f"[EXCEPTION] Error in generate_timetables_for_all_batches: {e}")
        import traceback
        traceback.print_exc()
        sys.stdout.flush()
        return {'success': False, 'error': str(e)}

# Replace the old generate_timetable_for_all with the new function

generate_timetable_for_all = generate_timetables_for_all_batches

print("[GA] Genetic Algorithm is running for timetable generation.")
sys.stdout.flush()
