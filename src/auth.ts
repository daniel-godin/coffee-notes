import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";

export function setupAuth(container: HTMLElement) {
    const authContent = `
    <div id='authPageContainer'>
        <div id='formContainer'>
        </div>
    </div>`;
    container.innerHTML = '';
    container.insertAdjacentHTML('afterbegin', authContent);
    const formContainer = document.getElementById('formContainer') as HTMLDivElement;
    signInForm(formContainer);
    signUpForm(formContainer);
}

function signInForm(container: HTMLElement) {
    const formContent = `
        <form id="signInForm" class='form-default auth-forms'>
            <h2>Sign In</h2>
            <input type="email" id="signInEmail" placeholder="Email" required>
            <input type="password" id="signInPassword" placeholder="Password" required>
            <button type="submit">Sign In</button>
        </form>
    `;
    container.insertAdjacentHTML('afterbegin', formContent);

    const signInForm = document.getElementById('signInForm') as HTMLFormElement;
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = (document.getElementById('signInEmail') as HTMLInputElement).value;
        const password = (document.getElementById('signInPassword') as HTMLInputElement).value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
            })
            .catch((error) => {
                console.error('Sign in error:', error.message);
            });
    });
};

function signUpForm(container: HTMLElement) {
    const formContent = `
        <form id="signUpForm" class='form-default auth-forms'>
            <h2>Sign Up</h2>
            <input type="email" id="signUpEmail" placeholder="Email" required>
            <input type="password" id="signUpPassword" placeholder="Password" required>
            <button type="submit">Sign Up</button>
        </form>
    `;
    container.insertAdjacentHTML('afterbegin', formContent);

    const signUpForm = document.getElementById('signUpForm') as HTMLFormElement;
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('signUpEmail') as HTMLInputElement).value;
        const password = (document.getElementById('signUpPassword') as HTMLInputElement).value;

        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                createUserInDatabase(user);
                // console.log('User signed up:', user);
            })
            .catch((error) => {
                console.error('Sign up error:', error.message);
                });
    });
};

async function createUserInDatabase(user: User) {

    interface UserPreferences {
        // Add user preference fields as needed
        theme: 'light' | 'dark';
        notifications: boolean;
        // ... other preferences
    }
      
    interface UserDocument {
        uid: string;
        email: string;
        displayName: string;
        createdAt: Timestamp;
        lastLogin: Timestamp;
        photoURL: string | null;
        phoneNumber: string | null;
        userPreferences: UserPreferences;
        accountStatus: 'active' | 'suspended' | 'inactive';
    }
      
    const createUserDocument: UserDocument = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
        photoURL: user.photoURL || null,
        phoneNumber: user.phoneNumber || null,
        userPreferences: {
            theme: 'light',
            notifications: true,
            // ... initialize other preferences with default values
        },
        accountStatus: 'active',
    };


    await setDoc(doc(db, 'users', user.uid), createUserDocument);

}