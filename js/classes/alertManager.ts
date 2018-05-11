/**
 * Classe gérant les messages d'alerte.
 */
class AlertManager{

    protected globalOverlayTarget : string;
    protected alertMessageTarget : string;

    /**
     * Stocke les sélecteurs correspondant à l'overlay global et au message d'alerte dans l'objet courant.
     *
     * @param {string} globalOverlayTarget
     * @param {string} alertMessageTarget
     */
    constructor(globalOverlayTarget : string, alertMessageTarget : string){
        this.globalOverlayTarget = globalOverlayTarget;
        this.alertMessageTarget = alertMessageTarget;
    }



    /**
     * Définit le texte du message d'erreur par la chaîne entrée en paramètre et affiche l'overlay et ledit message.
     * @param {string} message
     */
    public displayError(message : string) : void {
        $(this.alertMessageTarget).html(message);
        $(this.globalOverlayTarget).fadeIn(500);
    }

}