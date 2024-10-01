import './style.css'
import { createNav } from './nav';
import { setupAuth } from './auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './firebase';
import { addDoc, collection, doc, getDocs, setDoc } from 'firebase/firestore';


initApp();
function initApp() {
    const appStructure = `
        <nav id='navTopBar'></nav>
        <main id='mainContentContainer'></main>
    `;
    const root = document.getElementById('root') as HTMLDivElement;
    root.insertAdjacentHTML('afterbegin', appStructure);

    const navTopBar = document.getElementById('navTopBar') as HTMLElement;
    if (navTopBar) { createNav(navTopBar); } else { console.error('Nav container not found.'); };

    onAuthStateChanged(auth, (user) => {
        const mainContentContainer = document.getElementById('mainContentContainer') as HTMLElement;
        if (user) {
            if (mainContentContainer) { createMainContent(user, mainContentContainer); } else { console.error("Can't find Main Content Container"); };
        } else {
            if (mainContentContainer) { setupAuth(mainContentContainer);} else { console.error("Can't find Main Content Container"); };
        }
    })

    // const mainContentContainer = document.getElementById('mainContentContainer') as HTMLElement;
    // if (mainContentContainer) { createMainContent(mainContentContainer); } else { console.error('Main container not found.'); };

}

function createMainContent(user:User, container: HTMLElement) {
    // const mainContent = `<p>New Coffee Note</p>`;
    // container.innerHTML = '';
    // container.insertAdjacentHTML('afterbegin', mainContent);

    // displayCreateCoffeeNote(user, container);
    displayCoffeeNotes(user, container);
}

function displayCreateCoffeeNote(user:User, container: HTMLElement) {
    const coffeeNotePageContainer = `<div id='createCoffeeNotePageContainer'><div>`
    container.innerHTML = '';
    container.insertAdjacentHTML('afterbegin', coffeeNotePageContainer);

    const formCreateCoffeeNoteBasic = `
    <form id='createCoffeeNoteForm' class='form-default form-coffee-notes'>
        <h2>New Coffee Note</h2>
        
        <label for='coffee'>Coffee:</label>
        <input type='text' id='coffee' name='coffee' class='input-default' required />

        <label for='dateTried'>Date Tried:</label>
        <input type='date' id='dateTried' name='dateTried' />

        <label for='rating'>Rating:</label>
        <input type='number' id='rating' name='rating' min='1' max='5' step='0.5' />

        <label for='notes'>Notes:</label>
        <textarea id='notes' name='notes' rows='5' cols='30' placeholder='Write your thoughts about this coffee...'></textarea>

        <button type='submit' id='btnSubmitNewCoffeeNote' class='btn-default'>Add Coffee Note</button>

    </form>
    `;
    const createCoffeeNotePageContainer = document.getElementById('createCoffeeNotePageContainer') as HTMLDivElement;
    createCoffeeNotePageContainer.insertAdjacentHTML('afterbegin', formCreateCoffeeNoteBasic);


    const createCoffeeNoteForm = document.getElementById('createCoffeeNoteForm') as HTMLFormElement;
    createCoffeeNoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('coffee note creation submitted');
        const formData = new FormData(e.target);

        // Get a reference to the user's 'coffee-notes' collection
        const coffeeNotesRef = collection(db, 'users', user.uid, 'coffee-notes');

        // Generate a new document reference (this doesn't write to the database)
        const newDocRef = doc(coffeeNotesRef);

        const coffeeNoteData = {
            'id': newDocRef.id, // Include the ID in the initial data
            'coffee': formData.get('coffee'),
            'dateTried': formData.get('dateTried') || '',
            'rating': formData.get('rating') ? parseFloat(formData.get('rating')) : null,
            'notes': formData.get('notes') || '',
        }

        try {
            await setDoc(newDocRef, coffeeNoteData); // Using setDoc, instead of addDoc, because I've already created the document id above.
        } catch (error) {
            console.error("Error adding coffee note to document database:", error);
        }
    })
}

async function displayCoffeeNotes(user: User, container: HTMLElement) {
    const displayCoffeeNotesContainer = `
    <div id='displayCoffeeNotesPageContainer'>
        <div id='filterContainer'>
            <button type='button'>Filter Notes</button>
        </div>
        <div id='notesContainer'></div>
    </div>`
    container.innerHTML = '';
    container.insertAdjacentHTML('afterbegin', displayCoffeeNotesContainer);

    

    const coffeeNotes = [];
    const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'coffee-notes'));
    querySnapshot.forEach((doc) => {
        coffeeNotes.push(doc.data());
    })

    console.log(coffeeNotes);

    const notesContainer = document.getElementById('notesContainer') as HTMLDivElement;
    coffeeNotes.forEach((note) => {
        const HTMLNote = `
            <div id='${note.id}' class='note-containers'>
                <h3>${note.coffee}</h3>
                <p>Date Tried: ${note.dateTried}</p>
                <p>Rating: ${note.rating}</p>
                <p>Notes:</p>
                <p>${note.notes}</p>
            </div>
        
        `
        notesContainer.insertAdjacentHTML('beforeend', HTMLNote)
    })


}