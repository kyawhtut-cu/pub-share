(function(jQuery) {

	jQuery.Utils = function() {
		return {
			localStorage,
			setRipple,
			rgbToHex,
			getParameter,
			renderShopClose,
		}
	}

	const getParameter = (key) => {
		key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]")
		let regx = new RegExp("[\\?&]" + key + "=([^&#]*)")
		let results = regx.exec(location.search)
		return results === null ? `` : decodeURIComponent(results[1].replace(/\+/g, " "))
	}

	const rgbToHex = (rgb) => {
		if (rgb.search("rgb") === -1)
			return rgb
		else {
			rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			function hex(x) {
				return ("0" + parseInt(x).toString(16)).slice(-2);
			}
			return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
		}
	}

	const setRipple = (view) => {
		view.click(function(e) {

			const button = e.currentTarget

			const circle = document.createElement("span")
			
			const diameter = Math.max(button.clientWidth, button.clientHeight)
			const radius = diameter / 2

			circle.style.width = circle.style.height = `${diameter}px`
			circle.style.left = `${e.clientX - button.offsetLeft - radius}px`
			circle.style.top = `${e.clientY - button.offsetTop - radius}px`
			circle.classList.add("ripple")

			const ripple = button.getElementsByClassName("ripple")[0]

			if (ripple) {
				ripple.remove()
			}

			button.appendChild(circle)
		})
	}

	const renderShopClose = (Page) => {
		Page.empty()

		let list = [1, 2, 3, 4, 5, 6]

		list.forEach(index => {
			let item = $(`<div>`, {
				'class': `shop-close-demo`
			}).append($(`<div>`, {
				'class': `shop-close-demo`,
				'style': `background-image: url("data:image/png;base64,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")`
			}))

			Page.append(item)
		})

		$(`body`).append($(`<div>`, {
			'style': `position: absolute; bottom: 0; left: 0; width: 100%; background: red; display: flex; justify-content: center; align-items: center; padding: 8px 0; font-size: 24px; font-weight: 600; color: white;`,
			'id': `shopCloseLabel`
		}).text(`Shop closed`))
	}
}(jQuery))
