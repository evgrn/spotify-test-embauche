"use strict";
/**
 * Classe gérant l'application dans sa globalité
 */
var AppManager = /** @class */ (function () {
    /**
     * Effectue un appel AJAX vers le fichier de configuration pour en récupérer les paramètres et initialise l'application.
     * En cas d'erreur, affiche un message d'erreur.
     *
     * @param {boolean} prod
     */
    function AppManager(prod) {
        if (prod === void 0) { prod = false; }
        var _this = this;
        this.unableToLoadConfigMessage = 'Impossible de charger le fichier de configuration';
        $.ajax({
            dataType: "json",
            url: "config/config.json",
            timeout: 6000,
            success: function (data) {
                _this.setupApp(data, prod);
            },
            error: function (data) {
                alert(_this.unableToLoadConfigMessage);
            }
        });
    }
    /**
     * Stocke au sein de l'objet courant les informations de configuration contenues dans l'objet passé en paramètre
     * puis instancie la totalité des classes non-abstraites de l'application.
     * Si le paramètre "prod" vaut true, l'url choisie pour lecallback d'autorisation et celle correspondant à la production, sinon l'inverse.
     *
     * @param data
     * @param {boolean} prod
     */
    AppManager.prototype.setupApp = function (data, prod) {
        // Stockage des paramètres
        // Autorisations
        this.authorizationPageUrl = prod === true ? data.authorization.redirection_urls.prod : data.authorization.redirection_urls.dev;
        this.authorizationRedirectMessage = data.authorization.alert_messages.redirect;
        // Alertes
        this.globalOverlayTarget = data.alerts.selectors.global_overlay;
        this.alertMessageTarget = data.alerts.selectors.message;
        // Artiste
        this.artistListTarget = data.artist.selectors.list;
        this.inputTarget = data.artist.selectors.input;
        this.defaultArtistImgUrl = data.artist.defaults.img_url;
        this.artistsLoadingProblemMessage = data.artist.alert_messages.unable_to_load;
        // Albums
        this.albumListTarget = data.albums.selectors.list;
        this.nextSliceBar = data.albums.selectors.next_slice_bar;
        this.ajaxLoaderTarget = data.albums.ajax_loader;
        this.defaultAlbumImgUrl = data.albums.defaults.img_url;
        this.showMoreResultsText = data.albums.texts.show_more_results;
        this.noMoreResultsText = data.albums.texts.no_more_results;
        this.noResultMessage = data.albums.texts.no_album_found;
        this.albumsLoadingProblemMessage = data.albums.alert_messages.unalbe_to_load;
        // Instanciation des classes
        this.alertManager = new AlertManager(this.globalOverlayTarget, this.alertMessageTarget);
        this.authorizationManager = new AuthorizationManager(this.alertManager, this.authorizationPageUrl, this.authorizationRedirectMessage);
        this.artistManager = new ArtistManager({
            "alertManager": this.alertManager,
            "authorizationManager": this.authorizationManager,
            "listTarget": this.artistListTarget,
            "inputTarget": this.inputTarget,
            "albumListTarget": this.albumListTarget,
            "loadingProblemMessage": this.artistsLoadingProblemMessage,
            "defaultImgUrl": this.defaultArtistImgUrl
        });
        this.albumManager = new AlbumManager({
            "alertManager": this.alertManager,
            "authorizationManager": this.authorizationManager,
            "artistListTarget": this.artistListTarget,
            "listTarget": this.albumListTarget,
            "nextSliceBar": this.nextSliceBar,
            "ajaxLoaderTarget": this.ajaxLoaderTarget,
            "loadingProblemMessage": this.albumsLoadingProblemMessage,
            "showMoreResultsText": this.showMoreResultsText,
            "noMoreResultsText": this.noMoreResultsText,
            "noResultsMessage": this.noResultMessage
        });
    };
    return AppManager;
}());
