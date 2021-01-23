import { Random } from '/lib/random'


// example:  simplex = SimplexNoise(8, .6, 0.01, [0, 255])
//           r = simplex.noise(x, y)


export class SimplexNoise {
    constructor(iterations, persistence, scale) {
        this.iterations = iterations
        this.persistence = persistence
        this.scale = scale
        this.low = 0
        this.high = 255

        this.identity = [[1, 1], [-1, 1 ], [1, -1], [-1, -1],
                         [1, 0], [-1, 0 ], [1,  0], [-1,  0],
                         [0, 1], [ 0, -1], [0,  1], [ 0, -1]];
        const p = [];
        for (let i=0; i<256; i++) {
            p[i] = Random.int(255)
        }
        // To remove the need for index wrapping, double the permutation table length
        this.perm = [];
        for(let i=0; i<512; i++) {
            this.perm[i] = p[i & 255];
        }
    }

    noise(point) {
        let maxAmp = 0
        let amp = 1
        let freq = this.scale
        let noise = 0

        //add successively smaller, higher-frequency terms
        for(let i = 0; i < this.iterations; ++i) {
            noise += this._noise(point.x * freq, point.y * freq) * amp
            maxAmp += amp
            amp *= this.persistence
            freq *= 2
        }
        //take the average value of the iterations
        noise /= maxAmp
        //normalize the result
        return noise * (this.high - this.low) / 2 + (this.high + this.low) / 2
    }

    _noise(xin, yin) {
        // Skew the input space to determine which simplex cell we're in
        const F2 = 0.5*(Math.sqrt(3.0)-1.0)
        // Noise contributions from the three corners
        let n0, n1, n2
        let s = (xin + yin) * F2 // Hairy factor for 2D
        let i = Math.floor(xin+s)
        let j = Math.floor(yin+s)
        let G2 = (3.0-Math.sqrt(3.0)) / 6.0
        let t = (i + j) * G2
        let X0 = i - t // Unskew the cell origin back to (point.,y) space
        let Y0 = j - t
        let x0 = xin - X0 // The x,y distances from the cell origin
        let y0 = yin - Y0
        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        let i1, j1 // Offsets for second (middle) corner of simplex in (i,j) coords
        if(x0 > y0) {
            i1 = 1
            j1 = 0
        } else {  // lower triangle, XY order: (0,0)->(1,0)->(1,1)
            i1 = 0
            j1 = 1
        }   // upper triangle, YX order: (0,0)->(0,1)->(1,1)
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        let x1 = x0 - i1 + G2 // Offsets for middle corner in (x,y) unskewed coords
        let y1 = y0 - j1 + G2
        let x2 = x0 - 1.0 + 2.0 * G2 // Offsets for last corner in (x,y) unskewed coords
        let y2 = y0 - 1.0 + 2.0 * G2
        // Work out the hashed gradient indices of the three simplex corners
        let ii = i & 255
        let jj = j & 255
        let gi0 = this.perm[ii + this.perm[jj]] % 12
        let gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12
        let gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12
        // Calculate the contribution from the three corners
        let t0 = 0.5 - x0 * x0 - y0 * y0
        if(t0 < 0)
            n0 = 0.0
        else {
          t0 *= t0
          n0 = t0 * t0 * dot(this.identity[gi0], x0, y0) // (x,y) of identity used for 2D gradient
        }
        let t1 = 0.5 - x1 * x1 - y1 * y1
        if(t1 < 0)
            n1 = 0.0
        else {
          t1 *= t1
          n1 = t1 * t1 * dot(this.identity[gi1], x1, y1)
        }
        let t2 = 0.5 - x2 * x2 - y2 * y2
        if(t2 < 0)
            n2 = 0.0
        else {
          t2 *= t2
          n2 = t2 * t2 * dot(this.identity[gi2], x2, y2)
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 70.0 * (n0 + n1 + n2)
      }
}


function dot(g, x, y) {
    return g[0]*x + g[1]*y;
}