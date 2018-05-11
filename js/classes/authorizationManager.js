"use strict";
/**
 * Classe gérant le stockage du Token d'authentification pour les requêtes à l'API Spotify
 */
var AuthorizationManager = /** @class */ (function () {
    /**
     * Récupère les données textuelles de l'app relatives à la partie "authorization",  sauvegarde le Token dans le SessionStorage.
     * Si le token n'est pas valide, redirige vers la page d'autorisation.
     *
     * @param {AlertManager} alertManager
     * @param authorizationPageUrl
     * @param authorizationRedirectMessage
     */
    function AuthorizationManager(alertManager, authorizationPageUrl, authorizationRedirectMessage) {
        this.unableToLoadConfigMessage = 'Impossible de charger le fichier de configuration'; // TODO: dégager partout
        this.alertManager = alertManager;
        this.authorizationPageUrl = authorizationPageUrl;
        this.authorizationRedirectMessage = authorizationRedirectMessage;
        this.storeToken();
        if (!this.tokenIsValid()) {
            this.getAuthorization();
        }
    }
    /**
     * Si la valeur stockée en SessionStorage correspond à null ou "undefined', retourne false,
     * sinon, retourne true.
     *
     * @returns {boolean}
     */
    AuthorizationManager.prototype.tokenIsValid = function () {
        return !(this.getToken() === null || this.getToken() === 'undefined');
    };
    /**
     * Redirige vers la page d'autorisation.
     */
    AuthorizationManager.prototype.getAuthorization = function () {
        window.location = this.authorizationPageUrl;
    };
    /**
     * Sauvegarde le Token d'authentification pour les requêtes à l'API Spotify dans le SessionStorage
     */
    AuthorizationManager.prototype.storeToken = function () {
        // Récupération du token présent dans l'URL
        var hash = window.location.hash.substr(1);
        var hashArray = hash.split(/[&=]+/);
        var token = hashArray[1];
        // Stockage du token dans le SessionStorage
        if (window.sessionStorage) {
            window.sessionStorage.setItem('token', token);
        }
    };
    /**
     * Retourne la valeur du Token d'authentification stocké dans le SessionStorage
     * @returns {string | null}
     */
    AuthorizationManager.prototype.getToken = function () {
        return window.sessionStorage.getItem('token');
    };
    /**
     * Affiche un message expliquant que l'autorisation a expiré stocké dans la propriété "authorizationRedirectMessage" de l'objet courant
     * puis redirige vers la page d'autorisation.
     */
    AuthorizationManager.prototype.redirectToAuthorization = function () {
        var _this = this;
        this.alertManager.displayError(this.authorizationRedirectMessage);
        setTimeout(function () { return _this.getAuthorization(); }, 3000);
    };
    return AuthorizationManager;
}());
