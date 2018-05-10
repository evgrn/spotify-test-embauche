/**
 * Classe gérant le système de la recherche d'artistes
 */
class ArtistManager{

    protected authorizationManager : AuthorizationManager;
    protected listTarget : string;
    protected inputTarget : string;
    protected searchboxTarget : string;
    protected defaultImgUrl  : string;
    protected alertManager : AlertManager;
    protected loadingProblemMessage : string;
    protected hidingTriggerTarget : string;
    protected unableToLoadConfigMessage : string = 'Impossible de charger le fichier de configuration';


    /**
     * Récupère les données textuelles de l'app relatives à la partie "artist", stocke une instance d'AlertManager et d'AuthorizationManager entrées en paramètre, initialise les sélecteurs des éléments du dom correspondant au conteneur de la liste des artistes et au champ de recherche des artistes,
     * et écoute les frappes dans le champ de recherche.
     *
     * @param {AlertManager} alertManager
     * @param {AuthorizationManager} listTarget
     * @param {string} inputTarget
     * @param {string} authorizationManager
     * @param {string} albumListTarget
     */
    constructor(alertManager : AlertManager, authorizationManager : AuthorizationManager, listTarget : string, inputTarget : string, albumListTarget : string){

        const that = this;

        // Récupération des données textuelles de l'app relatives à la partie "artist"
        $.ajax({
            dataType: "json",
            url: "config/config.json",

            success: function(data){
                that.setupStrings(data);
            },

            error: function(){
                that.alertManager.displayError(that.unableToLoadConfigMessage);
            }
        });

        // Initialisation des sélecteurs
        this.alertManager = alertManager;
        this.authorizationManager = authorizationManager;
        this.listTarget = listTarget;
        this.inputTarget = inputTarget;
        this.searchboxTarget = inputTarget + ' input';
        this.hidingTriggerTarget = albumListTarget + ', ' + listTarget;

        // Initialisation de l'écoute des évènements
        this.listenTyping();
        this.listenToggleEvents();

    }

    /**
     * Initialisation des des données textuelles de l'app relatives à la partie "artist"
     *
     * @param {object} data
     */
    protected setupStrings(data : object){
        this.loadingProblemMessage = data.alert_messages.unable_to_load.artists;
        this.defaultImgUrl = data.default_image_url.artist;
    }



    /**
     * Affiche les resultats liés à la chaîne correspondant à la valeur de la barre de recherche
     * si sa longueur n'est pas nulle.
     */
    protected listenTyping() : void{
        $(this.searchboxTarget).on('keyup paste', (e)=>{
            if($(this.searchboxTarget).val().length > 0){
                this.loadItems($(this.searchboxTarget).val());
            }
        })
    }

    /**
     * Effectue une recherche d'artistes relative à la chaîne entrée en paramètre et affiche le résultat.
     * En cas d'erreur, s'il s'agit d'une erreur d'autorisation, redirige vers la page d'autorisation, sinon affiche un message d'erreur.
     */
    protected loadItems(searchTerm : string) : void {

        const that = this;

        $.ajax({
            url: 'https://api.spotify.com/v1/search',
            headers: {
                'Authorization': 'Bearer ' + this.authorizationManager.getToken()
            },
            data: {
                q: searchTerm,
                type: "artist",
                offset: 0,
                limit: 50
            },
            success: (response : object) : void => {
                // Affichage du résultat sur la page
                that.handleLoading(response);
            },
            error: (data) : void  =>{
                // S'il s'agit d'une erreur 401, affichage du message expliquant que l'autorisation a expiré et redirection vers la page d'autorisation
                if(data.status === 401){
                    that.authorizationManager.redirectToAuthorization();
                    return;
                }
                // Sinon affichage d'un message d'erreur
                 that.alertManager.displayError(this.loadingProblemMessage);
            }

        });
    }

    /**
     * Efface la liste des artistes courante.
     * Pour chaque élément correspondant à un artiste du tableau issu de l'objet passé en paramètre, remplace l'url de l'image par celle par défaut si elle est inexistante
     * et insère un élément "artiste" généré dynamiquement à partir des données dans la liste des albums.
     *
     * @param response
     */
    protected handleLoading(response : object) : void {
        const that = this;

        // Vidange la liste des artistes.
        $(this.listTarget).empty();

        // Génération les éléments "artist"
        $.map(response.artists.items, function(artist : object){
            // Remplacement de l'url de l'url de l'image par celle par défaut si inexistante
            let imgUrl = $(artist.images).length > 0 ? artist.images[2].url : that.defaultImgUrl;

            $(that.listTarget).append(that.template( artist.name, artist.id, imgUrl));
        });
    }


    /**
     * Génère un élément "artiste" à partir des paramètres entrés et d'un template.
     *
     * @param name
     * @param id
     * @param imgUrl
     * @returns {string}
     */
    protected template(name : string, id : string, imgUrl : string) : string {
        return `
            <div class="artist col-12" id="${id}">
                <div class="row">
                    <div class="col-1 img-container">
                        <img src="${imgUrl}" alt="${name}" />
                   </div>
                    <div class="col-11">
                        <p class="artist-name">${name}</p>
                    </div>
                </div>
                
            </div>
        `;

    }

    /**
     * Affiche la liste des suggestions d'artistes au clic sur la barre de recherche,
     * La cache lorsqu'elle est cliquée ou au clic sur la liste des albums
     *
     */
    protected listenToggleEvents() : void {
        $(this.searchboxTarget).on('click', () => {
            $(this.listTarget).fadeIn(200);
        });

        $(this.hidingTriggerTarget).on('click', () =>{
            $(this.listTarget).fadeOut(200);
        });
    }

}