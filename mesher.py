import gmsh
import sys
import math

gmsh.initialize()
gmsh.option.setNumber("General.Terminal", 1)
gmsh.option.setNumber("Mesh.Algorithm", 8)
gmsh.option.setNumber("Mesh.CharacteristicLengthMin", 1)
gmsh.option.setNumber("Mesh.CharacteristicLengthMax", 10)
gmsh.option.setNumber("Mesh.Optimize", 1)
gmsh.option.setNumber("Mesh.QualityType", 2)

gmsh.merge("C:/Users/ASUS/test.stl")
n = gmsh.model.getDimension()
s = gmsh.model.getEntities(n)
l = gmsh.model.geo.addSurfaceLoop([s[i][1] for i in range(len(s))])
gmsh.model.geo.addVolume([l])
gmsh.model.geo.synchronize()

gmsh.model.mesh.generate(3)

print("TEST")
print(gmsh.model.mesh.getNodes())

gmsh.write("mesh.stl")
gmsh.write("mesh.inp")

gmsh.finalize()

with open('mesh.inp') as f:
    fileLines = f.readlines()

fileLines = [x.strip() for x in fileLines]
fileLines = fileLines[3:]

nodes = []

for id, item in enumerate(fileLines):
    if (item != '******* E L E M E N T S *************'):
        itemList = item.split(', ')
        itemList.insert(0, 'N')
        node = ', '.join(itemList)
        nodes.append(node)
    else:
        fileLines = fileLines[id + 1:]
        break

for id, item in enumerate(fileLines):
    if (item == '*ELEMENT, type=C3D4, ELSET=Volume1'):
        fileLines = fileLines[id + 1:]
        break

tetraedrs = []

for id, item in enumerate(fileLines):
    itemList = item.split(', ')
    itemList[0] = 'E'
    tetra = ', '.join(itemList)
    tetraedrs.append(tetra)

f = open('apdlmesh.txt', 'w')

f.write('FINISH\n')
f.write('/CLEAR ! ,NOSTART\n')
f.write('/PREP7\n')
f.write('/TRIAD,LBOT\n')
f.write('/VIEW,1,1,1,1\n')
f.write('/ANGLE,1\n')
f.write('/VUP,,Z\n')
f.write('/ESHAPE,0\n')
f.write('MP,EX,1,2e11\n')
f.write('MP,PRXY,1,0.3\n')
f.write('!nodes\n')

for node in nodes:
    f.write(node + '\n')

f.write('NPLOT\n')
f.write('ET,1,SOLID285\n')

for tetra in tetraedrs:
    f.write(tetra + '\n')

f.write('EPLOT\n')

f.close()
