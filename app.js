var signInBtn = document.querySelector("#signInBtn");
var signOutBtn = document.querySelector("#signOutBtn");

function updateSigninStatus(isSignedIn) {
    var profile = document.querySelector("#profile");
    var profileName = profile.querySelector(".name");
    var profileImage = profile.querySelector(".image");
    var user = getUserInfo();

    if (isSignedIn) {
        profile.classList.remove("signedOut");
        profile.classList.add("signedIn");
        profileImage.src = user.imageUrl;
        profileName.textContent = user.name;
        main();
    } else {
        profile.classList.remove("signedIn");
        profile.classList.add("signedOut");
        profileImage.src = "";
        profileName.textContent = "";
        main(true);
    }
}

async function main(clear = false) {
    var listElement = document.querySelector(".entries");
    var totalElement = document.querySelector(".total");
    if (clear) {
        listElement.innerHTML = "";
        totalElement.innerHTML = "";
        return;
    }
    var entries = await managerGetEntries();
    entries.forEach((entry) => {
        listElement.appendChild(managerRenderEntry(entry));
    });
    var currencies = managerCalculateTotal(entries);
    totalElement.appendChild(managerRenderTotal(currencies));
}

handleClientLoad();
