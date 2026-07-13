document
.getElementById("loginForm")
.addEventListener("submit", async function(e){

    e.preventDefault();

    const email=document.getElementById("email").value;

    const password=document.getElementById("password").value;

    const error=document.getElementById("error");

    error.innerHTML="";

    const { error:loginError }=
    await supabaseClient.auth.signInWithPassword({

        email,
        password

    });

    if(loginError){

        error.innerHTML=loginError.message;

        return;

    }

    window.location="dashboard.html";

});