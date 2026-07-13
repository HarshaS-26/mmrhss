async function checkUser(){
    const { data } = await supabaseClient.auth.getUser();

    if(!data.user){
        window.location = "index.html";
    }
}

checkUser();

document.getElementById("logoutBtn").addEventListener("click", async function(){
    await supabaseClient.auth.signOut();
    window.location = "index.html";
});