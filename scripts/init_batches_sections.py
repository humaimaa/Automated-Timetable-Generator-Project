from ttgen.models import Batch, Section

batch_names = ['A', 'B', 'C', 'D', 'E']
for name in batch_names:
    batch, created = Batch.objects.get_or_create(name=name)
    for section_name in ['A', 'B']:
        Section.objects.get_or_create(name=section_name, batch=batch)
print('Batches and sections ensured.')
