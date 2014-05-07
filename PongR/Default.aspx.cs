using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace PongR
{
    public partial class Default : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        protected string RetrievePlayer()
        {
            if (!string.IsNullOrEmpty(Request["Player"]))
            { 
                if (Request["Player"] == "1")
                {
                    return "Paddle1";
                }

                if (Request["Player"] == "2")
                {
                    return "Paddle2";
                }
            }

            return string.Empty;
        }

    }
}