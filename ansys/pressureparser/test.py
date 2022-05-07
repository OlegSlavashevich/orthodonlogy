import json

with open('result.json') as json_file:
    data = json.load(json_file)
    kes = []
    for val in data:
        kes.append(val[2])
    
    print(max(kes))
    print(min(kes))