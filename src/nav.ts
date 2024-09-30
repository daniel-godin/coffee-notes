import { signOut } from "firebase/auth";
import { auth } from "./firebase";


// Functionality:
export function createNav(container: HTMLElement) {
    const navContent = `
        <a href='/'><h1>Coffee Notes</h1></a>
        <div id='createNoteContainer'>
            <button>+Create Coffee Note</button>
        </div>
        <button type='button' id='btnSignOut'>Sign Out</button>
    `;
    container.insertAdjacentHTML('afterbegin', navContent);
    
    const btnSignOut = document.getElementById('btnSignOut') as HTMLButtonElement;
    btnSignOut.addEventListener('click', async (e) => {
        e.preventDefault();
        await signOutUser();
    });
}

async function signOutUser() {
    try {
        await signOut(auth);
        console.log("Sign Out Successful");
    } catch (error) {
        console.error("An error occurred during sign out:", error);
    }
}