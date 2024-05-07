using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Common
{    public static class RandomGen
    {
        private static Random _global = new Random();
        [ThreadStatic]
        private static Random _local;

        public static double Next()
        {
            Random inst = _local;
            if (inst == null)
            {
                int seed;
                lock (_global) seed = _global.Next();
                _local = inst = new Random(seed);
            }
            return inst.NextDouble();
        }

        public static double NextDouble(uint i)
        {
            uint m_z = 36969 * (i & 65535) + (i >> 16);
            uint m_w = 18000 * ((i + 1) & 65535) + ((i + 1) >> 16);
            uint u = (m_z << 16) + m_w;            
            // The magic number below is 1/(2^32 + 2).
            // The result is strictly between 0 and 1.
            return (u + 1.0) * 2.328306435454494e-10;
        }
    }
}
