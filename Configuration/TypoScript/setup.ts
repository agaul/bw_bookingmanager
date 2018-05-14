
plugin.tx_bwbookingmanager_pi1 {
    view {
        templateRootPaths.0 = EXT:bw_bookingmanager/Resources/Private/Templates/
        templateRootPaths.1 = {$plugin.tx_bwbookingmanager_pi1.view.templateRootPath}
        partialRootPaths.0 = EXT:bw_bookingmanager/Resources/Private/Partials/
        partialRootPaths.1 = {$plugin.tx_bwbookingmanager_pi1.view.partialRootPath}
        layoutRootPaths.0 = EXT:bw_bookingmanager/Resources/Private/Layouts/
        layoutRootPaths.1 = {$plugin.tx_bwbookingmanager_pi1.view.layoutRootPath}
    }
    persistence {
        storagePid = {$plugin.tx_bwbookingmanager_pi1.persistence.storagePid}
        #recursive = 1
    }
    features {
        #skipDefaultArguments = 1
        # if set to 1, the enable fields are ignored in BE context
        ignoreAllEnableFieldsInBe = 0
        # Should be on by default, but can be disabled if all action in the plugin are uncached
        requireCHashArgumentForActionArguments = 1
    }
    mvc {
        #callDefaultActionIfActionCantBeResolved = 1
    }
    settings{
        showPid = {$plugin.tx_bwbookingmanager_pi1.settings.showPid}
        calendarPid = {$plugin.tx_bwbookingmanager_pi1.settings.calendarPid}
        entryPid = {$plugin.tx_bwbookingmanager_pi1.settings.entryPid}
        backPid = {$plugin.tx_bwbookingmanager_pi1.settings.backPid}
    }
}