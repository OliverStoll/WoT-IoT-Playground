import json
import os

with open('Simple_example.json') as f:
    data = json.load(f)

objects = []

for key, value in data.items():
    obj = {'key': key, 'name': value['name'], 'type': value['type']}
    objects.append(obj)

# build images
for obj in objects:
    print(f"Building image for: {obj['key']} ....)")
    cmd = f"docker build --build-arg TYPE={obj['type']} --build-arg NAME={obj['name']} --build-arg KEY={obj['key']} -t {obj['key']} ."
    os.system(cmd)

# run images
for obj in objects:
    print(f"Starting container for: {obj['key']} ....)")
    cmd = f"docker run {obj['key']}"
    os.system(cmd)



