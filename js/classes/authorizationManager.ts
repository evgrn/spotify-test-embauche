/**
 * Classe gérant le stockage du Token d'authentification pour les requêtes à l'API Spotify
 */
class AuthorizationManager{

    protected alertManager : AlertManager;
    protected authorizationPageUrl : string;
    protected authorizationRedirectMessage : string;
    protected unableToLoadConfigMessage : string = 'Impossible de charger le fichier de configuration';


    /**
     * Récupère les données textuelles de l'app relatives à la partie "authorization", initialise le sélecteur de l'overlay global de la page, sauvegarde le Token dans le SessionStorage.
     * Si le token n'est pas valide, redirige vers la page d'autorisation.
     *
     * @param {AlertManager} alertManager
     * @param {boolean} prod
     */
    constructor(alertManager : AlertManager, prod : boolean = false){

        this.alertManager = alertManager;

        const that = this;

        $.ajax({
            dataType: "json",
            url: "config/config.json",

            success: function(data){
                that.init(data, prod);
            },

            error: function(){
                that.alertManager.displayError(that.unableToLoadConfigMessage);
            }
        });

    }

    /**
     * Récupère les données textuelles de l'app relatives à la partie "authorization" et
     * sauvegarde le Token dans le SessionStorage.
     * Si le token n'est pas valide, redirige vers la page d'autorisation.
     *
     * @param {string} data
     * @param {boolean} prod
     */
    protected init(data : string, prod : boolean) : void {

        // Définition de la page de redirection en fonction de la situation ( dev / prod)
        this.authorizationPageUrl = prod === true ? data.authorization_url.prod : data.authorization_url.dev;

        this.authorizationRedirectMessage = data.alert_messages.authorization_redirect;
        this.storeToken();
        if(!this.tokenIsValid()){
            this.getAuthorization();
        }
    }

    /**
     * Si la valeur stockée en SessionStorage correspond à null ou "undefined', returne false,
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