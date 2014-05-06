using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace PongR
{
    public class PongGameHub : Hub
    {
        private readonly BallTicker ballTicker;

        public PongGameHub() : this(BallTicker.Instance) { }

        public PongGameHub(BallTicker _ballTicker)
        {
            ballTicker = _ballTicker;
        }

        public void MovePlayerOneUp()
        {
            ballTicker.PlayerOneUp();
        }

        public void MovePlayerOneDown()
        {
            ballTicker.PlayerOneDown();
        }

        public void MovePlayerTwoUp()
        {
            ballTicker.PlayerTwoUp();
        }

        public void MovePlayerTwoDown()
        {
            ballTicker.PlayerTwoDown();
        }
    }
}