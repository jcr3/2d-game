import numpy as np
import matplotlib.pyplot as plt

import opensimplex as simplex

def generateNoiseTex(xSize, ySize, xOffset, yOffset, windowSize, seed=None):

    if seed:
        simplex.seed(seed)
    else:
        simplex.random_seed()

    scale = xSize / 5000

    noise = simplex.noise2array((np.arange(xSize) + xOffset) * scale, (np.arange(ySize) + yOffset) * scale) # array of arrays
    noiseOctave1 = simplex.noise2array((np.arange(xSize) + xOffset) * 2 * scale, (np.arange(ySize) + xOffset) * 2 * scale)
    noiseOctave2 = simplex.noise2array((np.arange(xSize) + xOffset) * 4 * scale, (np.arange(ySize) + xOffset) * 4 * scale)
    noiseOctave3 = simplex.noise2array((np.arange(xSize) + xOffset) * 8 * scale, (np.arange(ySize) + xOffset) * 8 * scale)

    noise = noise + 0.5 * noiseOctave1 + 0.25 * noiseOctave2 + 0.125 * noiseOctave3

    fig, ax = plt.subplots(figsize=(windowSize[0] / 100, windowSize[1] / 100))

    plt.pcolormesh(noise, cmap = 'Greys')

    plt.axis('off')
    plt.subplots_adjust(left=0, right=1, top=1, bottom=0)

    fig.canvas.draw()

    plt.savefig('img.png', dpi=100)