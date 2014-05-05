using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Collections.Concurrent;
using Microsoft.AspNet.SignalR.Hubs;
using System.Threading;

namespace PongR
{
    public class BallTicker
    {
        // Singleton instance
        private readonly static Lazy<BallTicker> _instance = new Lazy<BallTicker>(() => new BallTicker(GlobalHost.ConnectionManager.GetHubContext<PongGameHub>().Clients));

        private readonly object _updateBallPositionLock = new object();

        private readonly TimeSpan _updateInterval = TimeSpan.FromMilliseconds(250);
        private readonly Random _updateOrNotRandom = new Random();

        private readonly Timer _timer;
        private volatile bool _updatingBallPosition = false;

        private int x = 0;
        private int y = 0;

        private BallTicker(IHubConnectionContext clients)
        {
            Clients = clients;

            _timer = new Timer(UpdateBallPosition, null, _updateInterval, _updateInterval);

        }

        public static BallTicker Instance
        {
            get
            {
                return _instance.Value;
            }
        }

        private IHubConnectionContext Clients
        {
            get;
            set;
        }

        private void UpdateBallPosition(object state)
        {
            lock (_updateBallPositionLock)
            {
                if (!_updatingBallPosition)
                {
                    _updatingBallPosition = true;

                    x += 1;
                    y += 1;

                    BroadcastBallPosition(x, y);

                    _updatingBallPosition = false;
                }
            }
        }


        private void BroadcastBallPosition(int x, int y)
        {
            Clients.All.updateBallPosition(x, y);
        }

    }
}