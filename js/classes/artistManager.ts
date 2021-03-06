/**
 * Classe gérant le système de la recherche d'artistes
 */
class ArtistManager extends APICallManager{

    protected authorizationManager : AuthorizationManager;
    protected listTarget : string;
    protected inputTarget : string;
    protected searchboxTarget : string;
    protected defaultImgUrl  : string;
    protected alertManager : AlertManager;
    protected loadingProblemMessage : string;
    protected hidingTriggerTarget : string;


    /**
     * Récupère les données textuelles de l'app relatives à la partie "artist", stocke une instance d'AlertManager et d'AuthorizationManager entrées en paramètre, initialise les sélecteurs des éléments du dom correspondant au conteneur de la liste des artistes et au champ de recherche des artistes,
     * et écoute les frappes dans le champ de recherche.
     *
     * @parameters {{alertManager: AlertManager; authorizationManager: AuthorizationManager; listTarget: string; inputTarget: string; albumListTarget: string; loadingProblemMessage: string; defaultImgUrl: string}} parameters
     */
    constructor(parameters : {alertManager : AlertManager, authorizationManager : AuthorizationManager, listTarget : string, inputTarget : string, albumListTarget : string, loadingProblemMessage : string, defaultImgUrl : string}){

        super(parameters.authorizationManager);

        // Initialisation des sélecteurs
        this.alertManager = parameters.alertManager;
        this.listTarget = parameters.listTarget;
        this.inputTarget = parameters.inputTarget;
        this.searchboxTarget = parameters.inputTarget + ' input';
        this.hidingTriggerTarget = parameters.albumListTarget + ', ' + parameters.listTarget;
        this.loadingProblemMessage = parameters.loadingProblemMessage;
        this.defaultImgUrl = parameters.defaultImgUrl;

        // Initialisation de l'écoute des évènements
        this.listenTyping();
        this.listenToggleEvents();

    }

    /**
     * Affiche les resultats liés à la chaîne correspondant à la valeur de la barre de recherche
     * si sa longueur n'est pas nulle et ignore les retours clavier.
     */
    protected listenTyping() : void{
        $(this.searchboxTarget).on('keyup paste', (e)=>{
            // Ignorer les retours clavier
            if(e.which == 13) {
                e.preventDefault();
            }
            // Afficher les résultats liés à la chaîne entrée
            if($(this.searchboxTarget).val().length > 0){
                this.loadArtists($(this.searchboxTarget).val());
            }
        })
    }

    /**
     * Effectue une recherche d'artistes relative à la chaîne entrée en paramètre et affiche le résultat.
     * En cas d'erreur, s'il s'agit d'une erreur d'autorisation, redirige vers la page d'autorisation, sinon affiche un message d'erreur.
     */
    protected loadArtists(searchTerm : string) : void {

        this.loadItems({
            "requestUrl" : 'https://api.spotify.com/v1/search',
            "query" : searchTerm,
            "type" : "artist",
            "offset" : 0,
            "limit" : 50,
            "successCallback" : (data) => this.handleLoadingSuccess(data),
            "errorCallback" : (error) => this.handleLoadingError(error)
        });
    }

    /**
     * Efface la liste des artistes courante.
     * Pour chaque élément correspondant à un artiste du tableau issu de l'objet passé en paramètre, remplace l'url de l'image par celle par défaut si elle est inexistante
     * et insère un élément "artiste" généré dynamiquement à partir des données dans la liste des albums.
     *
     * @param response
     */
    protected handleLoadingSuccess(response : object) : void {
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
                    <div class="col-sm-1 col-5 img-container">
                        <img src="${imgUrl}" alt="${name}" />
                   </div>
                    <div class="col-sm-11 col-7">
                        <p class="artist-name">${name}</p>
                    </div>
                </div>
                
            </div>
        `;

    }

    /**
     * Si l'erreur en paramètre correspond à un code 401, affiche du message expliquant que l'autorisation a expiré et redirige vers la page d'autorisation.
     * Affiche un message d'erreur sinon.
     *
     * @param {object} error
     */
    handleLoadingError(error : object) : void {
        // S'il s'agit d'une erreur 401, affichage du message expliquant que l'autorisation a expiré et redirection vers la page d'autorisation
        if(error.status === 401){
            this.authorizationManager.redirectToAuthorization();
            return;
        }
        // Sinon affichage d'un message d'erreur
        this.alertManager.displayError(this.loadingProblemMessage);
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