using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace PongR
{
    public class PongGameHub : Hub
    {
        private readonly PongGameTicker ballTicker;

        public PongGameHub() : this(PongGameTicker.Instance) { }

        public PongGameHub(PongGameTicker _ballTicker)
        {
            ballTicker = _ballTicker;
        }

        public void MovePaddle1Up()
        {
            ballTicker.Paddle1Up();
        }

        public void MovePaddle1Down()
        {
            ballTicker.Paddle1Down();
        }

        public void MovePaddle2Up()
        {
            ballTicker.Paddle2Up();
        }

        public void MovePaddle2Down()
        {
            ballTicker.Paddle2Down();
        }
    }
}