NG_DOCS={
  "sections": {
    "api": "API Documentation"
  },
  "pages": [
    {
      "section": "api",
      "id": "core",
      "shortName": "core",
      "type": "object",
      "moduleName": "core",
      "shortDescription": "This is the main module for the TAMU-UI-Core framework.",
      "keywords": "angular api build core framework imported intended main module object tamu tamu-ui-core ui webservice work"
    },
    {
      "section": "api",
      "id": "core.controller:AbstractController",
      "shortName": "AbstractController",
      "type": "controller",
      "moduleName": "core",
      "shortDescription": "This abstract controller should be inherited by all controllers using",
      "keywords": "$controller $scope $window abstract abstractcontroller access acutually adminstrator alert angular anonymously api assuming boolean browsing call control controller controllers core credential current error exposes extend extending functionality identity indicating inherited initiates isadmin isannotator isanonymous isassumed isassuming ismanager isuser method methods object process promise property recieved report reporterror reporting rest returns role role_admin role_annotator role_manger role_user scope service set storage storageservice tamu-ui-core user void webservice"
    },
    {
      "section": "api",
      "id": "core.controller:AuthenticationController",
      "shortName": "AuthenticationController",
      "type": "controller",
      "moduleName": "core",
      "shortDescription": "This authentication controller contains login and logout methods. These methods based on user credentials ",
      "keywords": "$controller $location $scope $window abstractcontroller access api authentication authenticationcontroller based controller core credentials default delete deletes direct extends login logout method methods modify navigate ng-controller provide require returns role role_anonymous roles service session sessionstorage set specific storage token user void"
    },
    {
      "section": "api",
      "id": "core.controller:UserController",
      "shortName": "UserController",
      "type": "controller",
      "moduleName": "core",
      "shortDescription": "This controller sets the user&#39;s role in session storage. Extends &#39;AbstractController&#39;",
      "keywords": "$controller $scope abstractcontroller api controller core extends ng-controller promise property ready role scope service session sets storage user usercontroller"
    },
    {
      "section": "api",
      "id": "core.directive:accordion",
      "shortName": "accordion",
      "type": "directive",
      "moduleName": "core",
      "shortDescription": "This accordion directive sets the tag &quot;single-expand&quot;=true which ensures that only one pane( one view) can be clicked open ",
      "keywords": "accordion api application clicked core directive ensures open pane panes service sets single-expand tag time true view"
    },
    {
      "section": "api",
      "id": "core.directive:alerts",
      "shortName": "alerts",
      "type": "directive",
      "moduleName": "core",
      "shortDescription": "The alerts element directive is used to provide alert messages based on the alert types in your application. Extends &#39;AbstractController&#39;",
      "keywords": "$controller $rootscope $scope $timeout abstractcontroller alert alertindex alertlist alerts alertservice api application array attr attributes based boolean channel class controller core coreconfig defaultalert directive duration element error extends facets fixed function handle list-unstyled messages method ngrepeat object passed points property provide remove result return returns store types utilizing variable view void warning"
    },
    {
      "section": "api",
      "id": "core.directive:modal",
      "shortName": "modal",
      "type": "directive",
      "moduleName": "core",
      "shortDescription": "The modal element directive is used to include a bootstrap style modal in your application.",
      "keywords": "$controller api application bootstrap core directive element example html iews include modal modal-header-class modal-header-primary modal-id modal-view style"
    },
    {
      "section": "api",
      "id": "core.directive:pane",
      "shortName": "pane",
      "type": "directive",
      "moduleName": "core",
      "shortDescription": "This pane directive uses the &#39;AccordionService&#39; to open and close the pane based on ",
      "keywords": "$anchorscroll $location $scope $timeout accordion accordionservice api application assigns attr based boolean clicked close closes core directive duration execute existing expanded false function html loading method object open opened pane paneid panes path previous promise property query query_string_for_myview replaces returns services set store stores string tag title toggle toggleexpanded url variable view views void"
    },
    {
      "section": "api",
      "id": "core.directive:tab",
      "shortName": "tab",
      "type": "directive",
      "moduleName": "core",
      "shortDescription": "The tab element directive uses the &#39;TabService&#39; which in turn uses the &#39; settingsView&#39; and the html file location to render",
      "keywords": "$scope activetab api clicked core directive element file html location myview path render set settingsview stored tab tabservice target turn variable view views"
    },
    {
      "section": "api",
      "id": "core.directive:tabs",
      "shortName": "tabs",
      "type": "directive",
      "moduleName": "core",
      "shortDescription": "The tabs element directive uses the &#39;TabService&#39; to set the &#39;activeTab&#39; and the $location services to provide the ",
      "keywords": "$location $routeparams activetab api clicked core directive element html myview path provide provided retrieves route services set settingsview tab tabs tabservice target url view views"
    },
    {
      "section": "api",
      "id": "core.directive:tabview",
      "shortName": "tabview",
      "type": "directive",
      "moduleName": "core",
      "shortDescription": "The tabview span element directive uses the &#39;TabService&#39; which in turn uses the &#39;attr&#39; object to get the html view",
      "keywords": "$scope active api attr class core directive element html myview object path property settings-view settingsview span store stores tab tabservice tabview target turn variable view views"
    },
    {
      "section": "api",
      "id": "core.directive:tamufooter",
      "shortName": "tamufooter",
      "type": "directive",
      "moduleName": "core",
      "shortDescription": "The tamufooter element directive is used to includes a TAMU specific footer information provided in footer.html file.",
      "keywords": "$controller $scope api attr core directive element file footer html includes object properties property provided specific store tamu tamufooter variable"
    },
    {
      "section": "api",
      "id": "core.directive:tamuheader",
      "shortName": "tamuheader",
      "type": "directive",
      "moduleName": "core",
      "shortDescription": "The tamuheader element directive is used to provide TAMU specific header information from header.html file.",
      "keywords": "$controller $scope api attr core directive element file header html object project property provide specific store tamu tamuheader title variable"
    },
    {
      "section": "api",
      "id": "core.directive:tooltip",
      "shortName": "tooltip",
      "type": "directive",
      "moduleName": "core",
      "shortDescription": "The tooltip element directive uses $timeout and $compile services. It has showTip hideTip ",
      "keywords": "$compile $event $scope $timeout aid api appended attr body boolean cancel compiles cordinate cordinates core depending directive display displayed duration element event execute executes false function hidden hidetip html inorder left linked message method mouse mousemove move object objects position positiontip produces property provided returns service services set showtimer showtip stored stores template text tipstyles tiptemplate tipvisible title toggle togglevisible tooltip top true values variable variables void"
    },
    {
      "section": "api",
      "id": "core.directive:useraffiliation",
      "shortName": "useraffiliation",
      "type": "directive",
      "moduleName": "core",
      "shortDescription": "The useraffiliation element directive provides the current user&#39;s affiliation in the application.",
      "keywords": "affiliation api application core current directive element user useraffiliation"
    },
    {
      "section": "api",
      "id": "core.directive:useremail",
      "shortName": "useremail",
      "type": "directive",
      "moduleName": "core",
      "shortDescription": "The useremail element directive provides current user&#39;s email obtained from the user credential in the application.",
      "keywords": "api application core credential current directive element email user useremail"
    },
    {
      "section": "api",
      "id": "core.directive:username",
      "shortName": "username",
      "type": "directive",
      "moduleName": "core",
      "shortDescription": "The username element directive provides the current user&#39;s first and last name combined as username in the application.",
      "keywords": "api application combined core current directive element user username"
    },
    {
      "section": "api",
      "id": "core.directive:useruin",
      "shortName": "useruin",
      "type": "directive",
      "moduleName": "core",
      "shortDescription": "The useruin element directive provides the current user&#39;s UIN in the application.",
      "keywords": "api application core current directive element uin user useruin"
    },
    {
      "section": "api",
      "id": "core.service:AbstractModel",
      "shortName": "AbstractModel",
      "type": "service",
      "moduleName": "core",
      "shortDescription": "This abstract model should be inherited by all models using",
      "keywords": "absrtactmodel abstract abstracted abstractmodel angular api capabilites contructor core data exposes extend extended extending extends funciton future futuredata including inherited inheriting method methods model models mymethod object promise re-extends returns service tamu-ui-core unwrap unwrapping unwraps update void webservice"
    },
    {
      "section": "api",
      "id": "core.service:AccordionService",
      "shortName": "AccordionService",
      "type": "service",
      "moduleName": "core",
      "shortDescription": "The AccordionService can add remove panes from the &#39;openPanes&#39; list using the &#39;paneID&#39; passed as an argument.",
      "keywords": "accordion accordionservice accrodion add adds api argument calls close closeall closes core key list loops member method object open openpanes pane paneid panes passed private property remain remove removes returns service store void"
    },
    {
      "section": "api",
      "id": "core.service:AssumedControl",
      "shortName": "AssumedControl",
      "type": "service",
      "moduleName": "core",
      "shortDescription": "This abstract model should be inherited by all models using",
      "keywords": "$scope abstract abstracted abstractmodel angular api assumedcontrol capabilites contructor core data exposes extend extended extending funciton including inherited methods model models mymethod returns service tamu-ui-core unwrapping webservice"
    },
    {
      "section": "api",
      "id": "core.service:RestApi",
      "shortName": "RestApi",
      "type": "service",
      "moduleName": "core",
      "shortDescription": "The RestApi Service facilitates all restful communication",
      "keywords": "$http $window anonymousget api application authenticated authservice behalf boolean communication configuration configured core counterpart facilitates functionality http implementation initiates isurl method object post private promise property reference req request restapi restful returns role role_anonymous service spring tamu user web webservice websocket wsapi"
    },
    {
      "section": "api",
      "id": "core.service:TabService",
      "shortName": "TabService",
      "type": "service",
      "moduleName": "core",
      "shortDescription": "The TabService assists the tabs directive, tab directive and the tabview directive to set and retrieve the active tab and to render the specific html view based on the settingsView target.This uses the $q service to asynchronously execute the setTab and getTab methods and return the specific values",
      "keywords": "$q active api assists asynchronously based completed core directive execute gettab html methods processing render retrieve return service set settab settingsview specific tab tabs tabservice tabview target values view"
    },
    {
      "section": "api",
      "id": "core.service:User",
      "shortName": "User",
      "type": "service",
      "moduleName": "core",
      "shortDescription": "This User service must be injected into a controller class that require dependency on User model. This model provides",
      "keywords": "$scope abstractmodel api class controller core credentials data dependency extended extends function futuredata injected model models myapp mycontroller require returns service user webservice wsapi"
    },
    {
      "section": "api",
      "id": "coreConfig",
      "shortName": "coreConfig",
      "type": "object",
      "moduleName": "coreConfig",
      "shortDescription": "A configuration object that is included in &#39;core&#39; as a constant",
      "keywords": "api configuration constant core coreconfig included object"
    }
  ],
  "apis": {
    "api": true
  },
  "html5Mode": false,
  "editExample": true,
  "startPage": "/api",
  "scripts": [
    "angular.min.js"
  ]
};