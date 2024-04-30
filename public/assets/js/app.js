(function (jQuery) {
    "use strict";

    let initDataUnsafe = Telegram.WebApp.initDataUnsafe || {}
    let DEBUG = true

    let App = {
        userId: null,
        MainButton: Telegram.WebApp.MainButton,
        BackButton: Telegram.WebApp.BackButton,
        isSupportedTelegram: Telegram.WebApp.platform !== `unknown`
    }

    jQuery.App = function (debug = false) {
        DEBUG = debug

        init()

        App.enableClosingConfirmation = enableClosingConfirmation
        App.disableClosingConfirmation = disableClosingConfirmation
        App.showMainButton = showMainButton
        App.hideMainButton = hideMainButton
        App.showBackButton = showBackButton
        App.hideBackButton = hideBackButton
        App.sendData = sendData
        App.expandApp = expandApp
        App.showAlert = showAlert
        App.showConfirm = showConfirm
        App.showPopup = showPopup
        App.showConfirmClose = showConfirmClose
        App.themeParams = themeParams
        App.close = close

        return App
    }

    const init = () => {

        processButton()

        try {
            App.userId = initDataUnsafe.user.id || null
        } catch (e) {
            App.userId = $.Utils().getParameter(`id`)
            console.log(e)
        }
        console.log(App.userId)

        if (!App.isSupportedTelegram) {
            $(`body`).addClass(`closed`)
        } else {
            $(`body`).removeClass(`closed`)
            $(`#shopCloseLabel`).remove()
        }
    }

    const processButton = () => {
        if (!App.isSupportedTelegram && DEBUG) {
            let body = $(`body`)
            let mButton = $(`<div>`, {
                'class': `main-button`
            })
            let bButton = $(`<div>`, {
                'class': `back-button`
            })
            body.append(mButton)
            body.append(bButton)
            App.MainButton = BootstrapMainButton(mButton)
            App.BackButton = BootstrapBackButton(bButton)
        }

        hideMainButton()
        hideBackButton()
    }

    const themeParams = () => {
        return Telegram.WebApp.themeParams
    }

    const enableClosingConfirmation = () => {
        Telegram.WebApp.enableClosingConfirmation()
    }

    const disableClosingConfirmation = () => {
        Telegram.WebApp.disableClosingConfirmation()
    }

    const showMainButton = () => {
        App.MainButton.show()
    }

    const hideMainButton = () => {
        App.MainButton.hide()
    }

    const showBackButton = () => {
        App.BackButton.show()
    }

    const hideBackButton = () => {
        App.BackButton.hide()
    }

    const sendData = (data) => {
        if (!App.isSupportedTelegram && DEBUG) {
            console.log(data)
            return
        }
        Telegram.WebApp.sendData(data)
    }

    const expandApp = () => {
        Telegram.WebApp.expand()
    }

    const showAlert = (message, callback) => {
        if (!App.isSupportedTelegram && DEBUG) {
            ShowJQueryAlert(
                "Alert",
                message,
                [
                    {button_id: `okay`, text: `Okay`}
                ],
                function () {
                    if (callback != null) callback()
                }
            )
            return
        }
        Telegram.WebApp.showAlert(message, callback)
    }

    const showConfirm = (message, callback) => {
        Telegram.WebApp.showConfirm(message, function (button_id) {
            if (callback != null) callback(button_id)
        })
    }

    const showPopup = (title, message, buttons, callback) => {
        if (!App.isSupportedTelegram && DEBUG) {
            ShowJQueryAlert(title, message, buttons, callback)
            return
        }
        Telegram.WebApp.showPopup({
            title: title,
            message: message,
            buttons: buttons
        }, function (button_id) {
            if (callback != null) callback(button_id)
        })
    }

    const showConfirmClose = () => {
        showPopup(
            "Online Shop Demo",
            "Changes that you made may not be saved",
            [
                {
                    id: 'close_anyway',
                    type: 'destructive',
                    text: 'Close anyway'
                },
                {
                    type: 'cancel'
                }
            ],
            function (button_id) {
                if (button_id === "close_anyway") close()
            }
        )
    }

    const close = () => {
        Telegram.WebApp.close()
    }

    const BootstrapMainButton = (parent) => {
        let child = $(`<button>`)
        $.Utils().setRipple(child)

        parent.append(child)

        let object = {
            text: ``,
            color: null,
            textColor: null,
            show: () => {
                parent.show()
            },
            hide: () => {
                parent.hide()
            },
            disable: () => {
                child.prop('disabled', true)
            },
            enable: () => {
                child.prop('disabled', false)
            },
            onClick: (callback) => {
                child.click(callback)
            }
        }
        Object.defineProperty(object, `text`, {
            get: function () {
                return child.text()
            },
            set: function (value) {
                child.text(value)
            }
        })
        Object.defineProperty(object, `color`, {
            get: function () {
                return $.Utils().rgbToHex(child.css('background-color'))
            },
            set: function (value) {
                child.css({'background-color': $.Utils().rgbToHex(value)})
            }
        })
        Object.defineProperty(object, `textColor`, {
            get: function () {
                return $.Utils().rgbToHex(child.css('color'))
            },
            set: function (value) {
                child.css({'color': $.Utils().rgbToHex(value)})
            }
        })
        return object
    }

    const BootstrapBackButton = (parent) => {
        parent.empty()

        let hideIcon = `fa-times`
        let showIcon = `fa-arrow-left`

        let icon = $(`<i>`, {
            'class': `fa`,
            'aria-hidden': `true`
        })
        parent.append(icon)

        return {
            show: () => {
                icon.removeClass(hideIcon)
                icon.addClass(showIcon)
            },
            hide: () => {
                icon.removeClass(showIcon)
                icon.addClass(hideIcon)
            },
            onClick: (callback) => {
                parent.click(callback)
            }
        }
    }

    const ShowJQueryAlert = (title, message, buttons, callback) => {
        $('body').append(`
	<dialog tabindex="-1" id="dialog" style="padding: 0; border-radius: 8px; border-style: none; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.25); width: 320px">
		<h4 style="margin: 24px 24px 0 24px;">${title}</h4>
		<p style="margin: 16px 24px;">${message}</p>
		<div id="actionView" style="margin: 0 8px 8px; display: flex; flex-direction: row-reverse; flex-wrap: wrap;"></div>
	</dialog>
`);
        let dialog = document.getElementById("dialog")
        buttons.forEach(button => {
            let buttonUI = $(`<button>`, {
                'style': `height: 36px; border: none; background: 0 0; border-radius: 2px; color: rgba(0, 0, 0, .87); margin: 0; min-width: 64px; padding: 0 16px; display: inline-block; font-size: 1rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0; transition: box-shadow .2s cubic-bezier(.4,0,1,1), background-color .2s cubic-bezier(.4,0,.2,1), color .2s cubic-bezier(.4,0,.2,1); cursor: pointer; text-decoration: none; text-align: center; line-height: 36px; user-select: none;`,
                'tabindex': `-1`,
                'onMouseOver': `this.style.backgroundColor='rgba(158, 158, 158, .2)'`,
                'onMouseOut': `this.style.backgroundColor='rgba(0, 0, 0, 0)'`
            }).text(button.text)
            buttonUI.click(function () {
                if (callback != null) callback(button.id)
                dialog.close()
                $(`#dialog`).remove()
            })
            $(`#actionView`).append(buttonUI)
        })
        dialog.showModal()
    }
}(jQuery))
