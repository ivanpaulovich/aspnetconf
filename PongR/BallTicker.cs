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

        private readonly object updateBallPositionLock = new object();

        private readonly TimeSpan _updateInterval = TimeSpan.FromMilliseconds(1000 / 30);

        private readonly Timer _timer;
        private volatile bool updatingBallPosition = false;

        private float ServerX = 0;
        private float ServerY = 0;
        private float VelX = 0;
        private float VelY = 0;

        public float PlayerOneY = 0;
        public float PlayerTwoY = 0;

        private const float BallMaxVelocity = 5;
        private const float PlayerMaxVelocity = 5;
        private const float PlayerWidth = 20;
        private const float PlayerHeight = 100;

        private const float PlayerOffSet = 5;
        private const float BallRadius = 20;

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
            lock (updateBallPositionLock)
            {
                if (!updatingBallPosition)
                {
                    updatingBallPosition = true;

                    ServerX += VelX;
                    ServerY += VelY;

                    if (ServerX + BallRadius < 0 || ServerX - BallRadius > 800)
                    {
                        //
                        // Terminou
                        //
                        Reset();
                    }
                    else
                    {
                        Random rnd = new Random();

                        if (ServerY - BallRadius < 0 || ServerY + BallRadius > 450)
                        {
                            //
                            // Bateu na tabela
                            //
                            VelY = VelY * -1;
                        }

                        if (ServerX - BallRadius < PlayerWidth + PlayerOffSet) // Perto da Pá
                        {
                            if (ServerY >= PlayerOneY && ServerY <= PlayerOneY + PlayerHeight)
                            {
                                //Bateu na pá
                                VelX = VelX * -1.5f;
                            }
                        }

                        if (ServerX + BallRadius > 800 - (PlayerWidth + PlayerOffSet)) // Perto da Pá
                        {
                            if (ServerY >= PlayerTwoY && ServerY <= PlayerTwoY + PlayerHeight)
                            {
                                //Bateu na pá
                                VelX = VelX * -1.5f;
                            }
                        }
                    }

                    Clients.All.updatePositions(ServerX, ServerY, PlayerOneY, PlayerTwoY);

                    updatingBallPosition = false;
                }
            }
        }

        private void Reset()
        {
            ServerX = 800 / 2;
            ServerY = 450 / 2;

            Random rnd = new Random();

            VelX = Convert.ToSingle(((rnd.Next(0, 2) == 0) ? rnd.NextDouble() : (rnd.NextDouble() * -1)) * BallMaxVelocity); 
            VelY = Convert.ToSingle(((rnd.Next(0, 2) == 0) ? rnd.NextDouble() : (rnd.NextDouble() * -1)) * BallMaxVelocity); 

            if (VelX > -1.5 && VelX < 1.5)
                VelX = BallMaxVelocity * 1.5f;

            if (VelY > -1.5 && VelY < 1.5)
                VelY = BallMaxVelocity * 1.5f;

            Clients.All.reset(ServerX, ServerY);
        }


        public void PlayerOneUp()
        {
            this.PlayerOneY -= PlayerMaxVelocity;
            if (this.PlayerOneY < 0)
                this.PlayerOneY = 0;
        }

        public void PlayerOneDown()
        {
            this.PlayerOneY += PlayerMaxVelocity;
            if (this.PlayerOneY + 100 > 450)
                this.PlayerOneY = 450 - 100;
        }

        public void PlayerTwoUp()
        {
            this.PlayerTwoY -= PlayerMaxVelocity;
            if (this.PlayerTwoY < 0)
                this.PlayerTwoY = 0;
        }

        public void PlayerTwoDown()
        {
            this.PlayerTwoY += PlayerMaxVelocity;
            if (this.PlayerTwoY + 100 > 450)
                this.PlayerTwoY = 450 - 100;
        }
    }
}