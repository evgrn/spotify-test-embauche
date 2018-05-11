"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Classe gérant l'affichage des albums
 */
var AlbumManager = /** @class */ (function (_super) {
    __extends(AlbumManager, _super);
    /**
     * Récupère les données textuelles de l'app relatives à la partie "albums", stocke une instance d'AlertManager et de AuthorizationManager entrées en paramètres, initialise les sélecteurs des éléments du dom correspondant au conteneur de la liste des artistes,
     * à celle des albums et à la barre permettant d'afficher les albums suivants.
     * Écoute le clic sur un bloc "artiste" et sur la barre de pagination.
     *
     * @parameters {{alertManager: AlertManager; authorizationManager: AuthorizationManager; artistListTarget: string; listTarget: string; nextSliceBar: string; ajaxLoaderTarget: string; loadingProblemMessage: string; showMoreResultsText: string; noMoreResultsText: string; noResultMessage: string}} parameters
     */
    function AlbumManager(parameters) {
        var _this = 
        // Appel au constructeur parent
        _super.call(this, parameters.authorizationManager) || this;
        _this.noMoreAlbums = false;
        _this.slice = 0;
        // Initialisation des sélecteurs
        _this.alertManager = parameters.alertManager;
        _this.authorizationManager = parameters.authorizationManager;
        _this.artistListTarget = parameters.artistListTarget;
        _this.listTarget = parameters.listTarget;
        _this.nextSliceBar = parameters.nextSliceBar;
        _this.nextSliceBarText = parameters.nextSliceBar + ' p';
        _this.ajaxLoaderTarget = parameters.ajaxLoaderTarget;
        _this.loadingProblemMessage = parameters.loadingProblemMessage;
        _this.showMoreResultsText = parameters.showMoreResultsText;
        _this.noMoreResultsText = parameters.noMoreResultsText;
        _this.noResultMessage = parameters.noResultMessage;
        _this.defaultImgUrl = parameters.defaultImgUrl;
        // Initialisation de l'écoute des évènements
        _this.listenTrigger();
        _this.listenNext();
        return _this;
    }
    /**
     * Génère un élément "album" à partir des paramètres entrés et d'un template.
     *
     * @param {string} imgUrl
     * @param {string} name
     * @param {string} url
     * @returns {string}
     */
    AlbumManager.prototype.template = function (imgUrl, name, url) {
        return "\n            <div class=\"album col-lg-2 col-sm-4\">\n                <img src=" + imgUrl + " alt=" + name + " />\n                <div class=\"album-overlay\">\n                    <h4 class=\"album-title\">" + name + "</h4>\n                    <a class=\"listen-button\" href=\"" + url + "\" target=\"_blank\"><button class=\"btn btn-success\">\u00C9couter</button></a>\n                \n                </div>\n            </div>\n            ";
    };
    /**
     *
     * Si la propriété "noMoreAlbums" vaut false, écupère les 18 albums relatifs à l'artiste dont l'ID est stocké dans la propriété "artist" de l'objet courant
     * en commençant par l'album correspondant dont l'index correspond à la propriété "slice" de l'objet courant.
     * En cas d'erreur, s'il s'agit d'une erreur 401, affiche le message expliquant que l'autorisation a expiré et redirige vers la page d'autorisation,
     * sinon affiche un message d'erreur.
     *
     */
    AlbumManager.prototype.LoadAlbums = function () {
        var _this = this;
        // S'il reste des albums à charger
        if (this.noMoreAlbums === false) {
            // Apparition du loader AJAX
            this.ajaxLoaderVisibility(true);
            this.loadItems({
                "requestUrl": "https://api.spotify.com/v1/artists/" + this.artist + "/albums",
                "query": this.artist,
                "type": "album",
                "offset": this.slice,
                "limit": 18,
                "successCallback": function (data) { return _this.handleLoadingSuccess(data); },
                "errorCallback": function (error) { return _this.handleLoadingError(error); }
            });
        }
    };
    /**
     * Si la propriété "items" de l'objet entré en paramètre est nulle, affiche les messages correspondant à une absence de résultat,
     * sinon, remplace l'url de l'image par celle par défaut si elle est inexistante
     * et génère les éléments "album" en fonction des données récupérées dans l'objet entré en paramètre, scrolle jusqu'en bas de la page et incrémente la pagination de 18.
     *
     * @param response
     */
    AlbumManager.prototype.handleLoadingSuccess = function (response) {
        var _this = this;
        // Si la requête ne retourne aucun album
        if ($(response.items).length < 1) {
            // Disparition du loader Ajax
            this.ajaxLoaderVisibility(false);
            this.notFound();
            return;
        }
        // Génération les éléments "album"
        var that = this;
        $.map(response.items, function (album) {
            // Remplacement de l'url de l'url de l'image par celle par défaut si inexistante
            var imgUrl = $(album.images).length > 0 ? album.images[0].url : that.defaultImgUrl;
            $('#album-list').append(_this.template(imgUrl, album.name, album.external_urls.spotify));
        });
        // scroll jusqu'en bas de la page
        $('body, html').animate({ scrollTop: $('body').height() }, 500);
        // Incrémentation du compteur de paginations
        this.slice += 18;
        // Disparition du loader Ajax
        this.ajaxLoaderVisibility(false);
    };
    /**
     * Définit la propriété "noMoreAlbums" par true. S'il s'agit de la première pargination d'albums, affiche un message prévenant qu'aucun album correspondant n'a été trouvé à la place de la liste d'albums,
     * affiche "fin des résultats" dans la barre de pagination sinon.
     */
    AlbumManager.prototype.notFound = function () {
        this.noMoreAlbums = true;
        // S'il s'agit de la première page
        if (this.slice == 0) {
            $('#album-list').html(this.noResultMessage);
        }
        // Si des albums ont déjà été affichés
        else {
            $(this.nextSliceBarText).text(this.noMoreResultsText);
        }
    };
    /**
     * Cache le loader AJAX, si l'erreur en paramètre correspond à un code 401, affiche du message expliquant que l'autorisation a expiré et redirige vers la page d'autorisation.
     * Affiche un message d'erreur sinon.
     *
     * @param error
     */
    AlbumManager.prototype.handleLoadingError = function (error) {
        // Disparition du loader AJAX
        this.ajaxLoaderVisibility(false);
        // S'il s'agit d'une erreur 401, affichage du message expliquant que l'autorisation a expiré et redirection vers la page d'autorisation
        if (error.status === 401) {
            this.authorizationManager.redirectToAuthorization();
            return;
        }
        // Sinon affichage d'un message d'erreur
        this.alertManager.displayError(this.loadingProblemMessage);
    };
    /**
     * Affiche la pagination d'albums suivante au clic sur la barre de pagination.
     */
    AlbumManager.prototype.listenNext = function () {
        var _this = this;
        var that = this;
        $('#next-slice-container').on('click', function () {
            _this.LoadAlbums();
        });
    };
    /**
     * Au clic sur un bloc "artist", vide le container des albums, définit la propriété "noMoreAlbums" par false, réinitialise la propriété "slice" de l'objet courant
     * stocke la valeur de son ID dans la propriété "artist" de l'objet courant,
     * affiche la barre de pagination et affiche la pagination d'albums correspondante.
     */
    AlbumManager.prototype.listenTrigger = function () {
        var that = this;
        $(this.artistListTarget).on("click", ".artist", function () {
            that.noMoreAlbums = false;
            $(that.listTarget).empty();
            that.slice = 0;
            that.artist = $(this).attr('id');
            that.showNextSliceBar();
            that.LoadAlbums();
        });
    };
    /**
     * Si le paramètre vaut true, affiche le loader, sinon le cache.
     *
     * @param {boolean} visible
     */
    AlbumManager.prototype.ajaxLoaderVisibility = function (visible) {
        if (visible === true) {
            $(this.ajaxLoaderTarget).fadeIn(200).css('display', 'flex');
            return;
        }
        $(this.ajaxLoaderTarget).fadeOut(200);
    };
    /**
     * Affiche la barre de pagination et définit son texte par "Plus d'albums".
     */
    AlbumManager.prototype.showNextSliceBar = function () {
        $(this.nextSliceBarText).text(this.showMoreResultsText);
        $(this.nextSliceBar).fadeIn(500);
    };
    return AlbumManager;
}(APICallManager));
