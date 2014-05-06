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

        private readonly TimeSpan _updateInterval = TimeSpan.FromMilliseconds(1000 / 60);
        private readonly Random _updateOrNotRandom = new Random();

        private readonly Timer _timer;
        private volatile bool _updatingBallPosition = false;

        private float ServerX = 0;
        private float ServerY = 0;
        private float VelX = 0;
        private float VelY = 0;

        public float PlayerOneY = 0;
        public float PlayerTwoY = 0;

        private BallTicker(IHubConnectionContext clients)
        {
            Clients = clients;

            _timer = new Timer(UpdateBallPosition, null, _updateInterval, _updateInterval);

            Reset();

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

                    ServerX += VelX;
                    ServerY += VelY;

                    if (ServerY - 10 < 0 || ServerY + 10 > 450)
                        VelY *= -1;

                    if (ServerX - 10 <= 0)
                    {
                        if (ServerY >= PlayerOneY && ServerY <= PlayerOneY + 100)
                        {
                            VelX *= -1;
                        }
                        else
                        {
                            Reset();
                        }
                    }

                    if (ServerX + 10 > 800)
                    {
                        if (ServerY >= PlayerTwoY && ServerY <= PlayerTwoY + 100)
                        {
                            VelX *= -1;
                        }
                        else
                        {
                            Reset();
                        }
                    }

                    Clients.All.updatePositions(ServerX, ServerY, PlayerOneY, PlayerTwoY);

                    _updatingBallPosition = false;
                }
            }
        }

        private void Reset()
        {
            ServerX = 800 / 2;
            ServerY = 450 / 2;

            Random rnd = new Random();

            VelX = Convert.ToSingle(rnd.NextDouble() * 5);
            VelY = Convert.ToSingle(rnd.NextDouble() * 5);

            if (VelX == 0)
                VelX = 5;

            if (VelY == 0)
                VelY = 5;
        }


        public void PlayerOneUp()
        {
            this.PlayerOneY -= 1;
            if (this.PlayerOneY < 0)
                this.PlayerOneY = 0;
        }

        public void PlayerOneDown()
        {
            this.PlayerOneY += 1;
            if (this.PlayerOneY + 100 > 450)
                this.PlayerOneY = 450 - 100;
        }

        public void PlayerTwoUp()
        {
            this.PlayerTwoY -= 1;
            if (this.PlayerTwoY < 0)
                this.PlayerTwoY = 0;
        }

        public void PlayerTwoDown()
        {
            this.PlayerTwoY += 1;
            if (this.PlayerTwoY + 100 > 450)
                this.PlayerTwoY = 450 - 100;
        }
    }
}