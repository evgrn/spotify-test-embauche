/**
 * Classe abstraite gérant les appels à l'API Spotify
 */
abstract class APICallManager{

    protected authorizationManager : AuthorizationManager;

    /**
     * Stocke une instance d'AuthorizationManager.
     *
     * @param {AuthorizationManager} authorizationManager
     */
    constructor(authorizationManager : AuthorizationManager){
        this.authorizationManager = authorizationManager;
    }


    /**
     * Effectue une requête AJAX en fonction des paramètres et appelle son callback de succès ou d'erreur selon la situation.
     *
     * @parameters {{requestUrl: string; query: string; type: string; offset: number; limit: number; successCallback: Function; errorCallback: Function}} parameters
     */
    protected loadItems(parameters : {requestUrl : string, query : string, type: string, offset : number, limit: number, successCallback : Function, errorCallback : Function}) : void {

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
            success: (response : object) => {
                parameters.successCallback(response);

            },
            error: function(data){
                parameters.errorCallback(data);
            }

        });
    }
}