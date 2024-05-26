import matplotlib.pyplot as plt
import csv
import numpy as np

file_path_clusters = 'Clusters.csv' 
file_path_centersss = 'Centers.csv'  

with open(file_path_centersss, 'r') as file:
    csv_reader = csv.reader(file)
    center_x = []
    center_y = []
    for row in csv_reader:
        center_x.append(float(row[0]))
        center_y.append(float(row[1]))


data = np.loadtxt(file_path_clusters, delimiter=',')

sections = np.split(data, np.where((data[:, 0] == 5555) & (data[:, 1] == 5555))[0] + 1)

plt.figure(figsize=(30, 9.53))

for section in sections:
    plt.scatter(section[:, 0], section[:, 1], alpha=0.9, s=10)

plt.scatter(center_x, center_y, alpha=1, s=30, color="black")
plt.subplots_adjust(left=0.035, right=0.996, top=0.994, bottom=0.025)
plt.xlim(-5000, 5000)
plt.ylim(-5000, 5000)

plt.show()