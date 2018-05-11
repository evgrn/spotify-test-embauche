"use strict";
/**
 * Classe gérant les messages d'alerte.
 */
var AlertManager = /** @class */ (function () {
    /**
     * Stocke les sélecteurs correspondant à l'overlay global et au message d'alerte dans l'objet courant.
     *
     * @param {string} globalOverlayTarget
     * @param {string} alertMessageTarget
     */
    function AlertManager(globalOverlayTarget, alertMessageTarget) {
        this.globalOverlayTarget = globalOverlayTarget;
        this.alertMessageTarget = alertMessageTarget;
    }
    /**
     * Définit le texte du message d'erreur par la chaîne entrée en paramètre et affiche l'overlay et ledit message.
     * @param {string} message
     */
    AlertManager.prototype.displayError = function (message) {
        $(this.alertMessageTarget).html(message);
        $(this.globalOverlayTarget).fadeIn(500);
    };
    return AlertManager;
}());
