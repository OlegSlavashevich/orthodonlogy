import json


def load_file(filename):
    with open(filename) as file:
        array = [row.strip() for row in file]

    array = list(filter(lambda x: '*' not in x, array))

    for i in range(0, len(array)):
        array[i] = array[i].split(',')
        for j in range(0, len(array[i])):
            array[i][j] = float(array[i][j])
    
    return array

def save_to_json(file):
    for i in range(0, len(file)):
        file[i] = [file[i][4], file[i][0], file[i][1], file[i][2]]


    with open('result.json', 'w', encoding='utf-8') as f:
        json.dump(file, f)

def main():
    file = load_file('../result/Results_StressesOnly.txt')
    save_to_json(file)


if __name__ == '__main__':
    main()