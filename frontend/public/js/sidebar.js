document.addEventListener("DOMContentLoaded", function (event) {


    ///Sidebar , boxes and footer js , toggle action happens here 
    const showNavbar = (toggleId, navId, bodyId, headerId) => {
        const toggle = document.getElementById(toggleId),
            nav = document.getElementById(navId),
            bodypd = document.getElementById(bodyId),
            headerpd = document.getElementById(headerId)

        // Validate that all variables exist
        if (toggle && nav && bodypd && headerpd) {

            toggle.addEventListener('click', () => {
                // show navbar
                nav.classList.toggle('show1')
                // change icon
                toggle.classList.toggle('bx-x')
                // add padding to body
                bodypd.classList.toggle('body-pd')
                // add padding to header
                headerpd.classList.toggle('body-pd')

                if (document.getElementById("maindiv").style.marginLeft == "-20px") {
                    document.getElementById("maindiv").style.marginLeft = "73px"
                }
                else {
                    document.getElementById("maindiv").style.marginLeft = "-20px";
                }

                ///footer toggle , get shifted to right b y this click

                if (document.getElementById("footer_toggle").style.marginLeft == "154px") {
                    document.getElementById("footer_toggle").style.marginLeft = "0px"
                }
                else {
                    document.getElementById("footer_toggle").style.marginLeft = "154px";
                }


            })
        }
    }

    showNavbar('header-toggle', 'nav-bar', 'body-pd', 'header')


    /*===== LINK ACTIVE =====*/
    const linkColor = document.querySelectorAll('.nav_link')

    function colorLink() {
        if (linkColor) {
            linkColor.forEach(l => l.classList.remove('active'))
            this.classList.add('active')
        }
    }
    linkColor.forEach(l => l.addEventListener('click', colorLink))

    // Your code to run since DOM is loaded and ready
});