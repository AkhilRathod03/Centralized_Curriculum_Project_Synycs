import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Institution

def add_colleges():
    colleges = [
        {"name": "Oxford Institute of Technology", "code": "OIT", "address": "Oxford, UK"},
        {"name": "Stanford Global Academy", "code": "SGA", "address": "Stanford, USA"},
        {"name": "Cambridge Science College", "code": "CSC", "address": "Cambridge, UK"}
    ]
    
    for coll in colleges:
        inst, created = Institution.objects.get_or_create(
            code=coll['code'],
            defaults={
                'name': coll['name'],
                'address': coll['address'],
                'is_active': True
            }
        )
        print(f"{'Created' if created else 'Exists'}: {coll['name']} ({coll['code']})")

if __name__ == "__main__":
    add_colleges()
