/**
 * Classe gérant le stockage du Token d'authentification pour les requêtes à l'API Spotify
 */
class AuthorizationManager{

    protected alertManager : AlertManager;
    protected authorizationPageUrl : string;
    protected authorizationRedirectMessage : string;
    protected unableToLoadConfigMessage : string = 'Impossible de charger le fichier de configuration'; // TODO: dégager partout


    /**
     * Récupère les données textuelles de l'app relatives à la partie "authorization",  sauvegarde le Token dans le SessionStorage.
     * Si le token n'est pas valide, redirige vers la page d'autorisation.
     *
     * @param {AlertManager} alertManager
     * @param authorizationPageUrl
     * @param authorizationRedirectMessage
     */
    constructor(alertManager : AlertManager, authorizationPageUrl : string, authorizationRedirectMessage : string){

        this.alertManager = alertManager;
        this.authorizationPageUrl = authorizationPageUrl;
        this.authorizationRedirectMessage = authorizationRedirectMessage;

        this.storeToken();
        if(!this.tokenIsValid()){
            this.getAuthorization();
        }

    }


    /**
     * Si la valeur stockée en SessionStorage correspond à null ou "undefined', retourne false,
     * sinon, retourne true.
     *
     * @returns {boolean}
     */
    protected tokenIsValid() : boolean {
        return !(this.getToken() === null || this.getToken() === 'undefined');
    }

    /**
     * Redirige vers la page d'autorisation.
     */
    protected getAuthorization() : void{
        window.location = this.authorizationPageUrl;
    }

    /**
     * Sauvegarde le Token d'authentification pour les requêtes à l'API Spotify dans le SessionStorage
     */
    protected storeToken() : void {

        // Récupération du token présent dans l'URL
        const hash = window.location.hash.substr(1);
        const hashArray = hash.split(/[&=]+/);
        const token = hashArray[1];

        // Stockage du token dans le SessionStorage
        if(window.sessionStorage){
            window.sessionStorage.setItem('token', token);
        }
    }

    /**
     * Retourne la valeur du Token d'authentification stocké dans le SessionStorage
     * @returns {string | null}
     */
    public getToken() : string|null {
        return window.sessionStorage.getItem('token');
    }

    /**
     * Affiche un message expliquant que l'autorisation a expiré stocké dans la propriété "authorizationRedirectMessage" de l'objet courant
     * puis redirige vers la page d'autorisation.
     */
    public redirectToAuthorization() : void {
        this.alertManager.displayError(this.authorizationRedirectMessage);
        setTimeout(()=> this.getAuthorization(), 3000);
    }
}