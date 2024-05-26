import csv
import matplotlib.pyplot as plt

names = ["Non", "TabuSearch", "SimulatedAnnealing"]

fig, axes = plt.subplots(1, 3, figsize=(18, 6)) 

for i, name in enumerate(names):
    city_coordinates = []

    with open(name + '_data.csv', mode='r') as file:
        csv_reader = csv.reader(file)

        for row in csv_reader:
            pair = (int(row[0]), int(row[1]))
            city_coordinates.append(pair)

    x_coords, y_coords = zip(*city_coordinates)

    axes[i].scatter(x_coords, y_coords, marker='o', label='Cities')
    axes[i].plot(x_coords + (x_coords[0],), y_coords + (y_coords[0],), linestyle='-', color='red', label='TSP Path')

    if(name == "Non"):
        axes[i].set_title('TSP Solution: No algorithm')
    else:
        axes[i].set_title('TSP Solution: ' + name)
    axes[i].set_xlabel('X-coordinate')
    axes[i].set_ylabel('Y-coordinate')
    axes[i].legend()
    axes[i].grid()

plt.show()
    
    