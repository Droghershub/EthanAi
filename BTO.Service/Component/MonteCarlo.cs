using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Common;
using MathNet.Numerics.Distributions;
namespace BTO.Service.Component
{
    public class MonteCarlo
    {
        private static Random _inst = new Random();
        [ThreadStaticAttribute]
        Random random = new Random(Environment.TickCount);
        private long number_trials;
        private double volatility;
        private double risk_return;
        private double current_saving;
        private double top;
        private double medium;
        private double bottom;
        private List<double> cash_flow;

        public MonteCarlo(int _number_trials, double _volatility, double _risk_return,double _current_saving,double _top,double _bottom,List<double> _cash_flow)
        {
            number_trials = _number_trials;
            current_saving = _current_saving;
            cash_flow = _cash_flow;
            volatility = _volatility;
            risk_return = _risk_return;
            medium = 0.5;
            top = _top;
            bottom = _bottom;
        }

        public static double Next()
        {
            lock (_inst) return _inst.NextDouble();
        } 
        private double NormalInverse()
        {
            double d = Next();//random.NextDouble();
            d =  ContinuousUniform.InvCDF(1 + this.risk_return - this.volatility, 1 + this.risk_return + this.volatility, d);            
            return d;
        }
        private double Percentile(double[] sequence, double percent)
        {
            int N = sequence.Length;
            double n = (N - 1) * percent + 1;
            if (n == 1d) return sequence[0];
            else if (n == N) return sequence[N - 1];
            else
            {
                int k = (int)n;
                double d = n - k;
                return sequence[k - 1] + d * (sequence[k] - sequence[k - 1]);
            }            
        }
        public List<MonteCarloModel> simulate()
        {
            List<MonteCarloModel> result = new List<MonteCarloModel>(); 
            double open_value;             
            double[] trials = new double[number_trials];
            double[] sorted_trials = new double[number_trials];
            for (int i = 0; i < cash_flow.Count; i++)
            {
                //for (int j = 0; j < number_trials; j++)
                Parallel.For(0, number_trials - 1, j =>
                {
                    if (i == 0) open_value = this.current_saving;
                    else open_value = trials[j];

                    trials[j] = (open_value + cash_flow[i]) * NormalInverse();
                    sorted_trials[j] = trials[j];
                });
                Array.Sort(sorted_trials);
                
                MonteCarloModel model = new MonteCarloModel();
                model.TopValue = this.top <= 0 ? 0 : Percentile(sorted_trials, 1 - this.top);
                model.MediumValue = Percentile(sorted_trials,this.medium);
                model.BottomValue = this.bottom <= 0 ? 0 : Percentile(sorted_trials, this.bottom);

                result.Add(model);
            }
            return result;
            
        }
    }
}
