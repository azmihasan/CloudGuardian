import json
import re
import os

PROJECTS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'projects.json')

def slugify(text):
    """
    Converts text to a URL-safe slug.
    """
    text = text.lower()
    text = re.sub(r'[^a-z0-9-]', '-', text) # Replace non-alphanumeric with hyphens
    text = re.sub(r'-+', '-', text) # Replace multiple hyphens with a single one
    text = text.strip('-')
    return text

def migrate_project_ids():
    try:
        with open(PROJECTS_FILE, 'r', encoding='utf-8') as f:
            projects = json.load(f)
    except FileNotFoundError:
        print(f"Error: {PROJECTS_FILE} not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {PROJECTS_FILE}. File might be empty or corrupted.")
        return

    migrated_projects = []
    for project in projects:
        if project.get('type') in ['docker', 'kubernetes']:
            old_id = project['id']
            new_id = slugify(project['name'])
            if old_id != new_id:
                print(f"Migrating project ID: {old_id} -> {new_id}")
                project['id'] = new_id
        migrated_projects.append(project)

    try:
        with open(PROJECTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(migrated_projects, f, indent=2)
        print(f"Successfully migrated project IDs in {PROJECTS_FILE}")
    except Exception as e:
        print(f"Error writing to {PROJECTS_FILE}: {e}")

if __name__ == '__main__':
    migrate_project_ids() 