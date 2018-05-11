"use strict";
/**
 * Classe abstraite gérant les appels à l'API Spotify
 */
var APICallManager = /** @class */ (function () {
    /**
     * Stocke une instance d'AuthorizationManager.
     *
     * @param {AuthorizationManager} authorizationManager
     */
    function APICallManager(authorizationManager) {
        this.authorizationManager = authorizationManager;
    }
    /**
     * Effectue une requête AJAX en fonction des paramètres et appelle son callback de succès ou d'erreur selon la situation.
     *
     * @parameters {{requestUrl: string; query: string; type: string; offset: number; limit: number; successCallback: Function; errorCallback: Function}} parameters
     */
    APICallManager.prototype.loadItems = function (parameters) {
        $.ajax({
            url: parameters.requestUrl,
            headers: {
                'Authorization': 'Bearer ' + this.authorizationManager.getToken()
            },
            data: {
                q: parameters.query,
                type: parameters.type,
                offset: parameters.offset,
                limit: parameters.limit
            },
            success: function (response) {
                parameters.successCallback(response);
            },
            error: function (data) {
                parameters.errorCallback(data);
            }
        });
    };
    return APICallManager;
}());
