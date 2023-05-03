import './vendor';
import vars from './helpers';
import './components/social';
import {ieFix} from './vendor/ie-fix';
import {vhFix} from './vendor/vh-fix';
import lazyLoading from './modules/lazyLoading';
import scrollToAnchor from './modules/scrollToAnchor';
import Swiper, { Navigation, Pagination, EffectFade, Thumbs, } from 'swiper';
import 'jquery-validation';
import '../../node_modules/jquery-validation/dist/additional-methods.js';
import '../../node_modules/jquery-validation/dist/localization/messages_ru.js';
// import { fancybox } from '@fancyapps/fancybox';
import { fancybox } from './vendor/fancybox3.5.7-rutube-support/jquery.fancybox';
import inputmask from 'inputmask/dist/jquery.inputmask';
import select2 from 'select2';
import datetimepicker from 'jquery-datetimepicker';

Swiper.use([Navigation, Pagination, EffectFade, Thumbs,]);

ieFix();
vhFix();
lazyLoading.init();

const $document = $(document);

const $window = $(window);

const $html = $('html');

const $body = $('body');

scrollToAnchor.init();

lazyLoading.init();

$.datetimepicker.setLocale('ru');

jQuery.extend(jQuery.validator.messages, {
	required: 'Поле обязательно для заполнения',
	email: 'Укажите корректный E-mail',
});

$.validator.addMethod(
	'regex',
	function (value, element, regexp) {
		if (regexp && regexp.constructor != RegExp) {
			regexp = new RegExp(regexp[0], regexp[1]);
		} else if (regexp.global) {
			regexp.lastIndex = 0;
		}

		return this.optional(element) || regexp.test(value);
	},
	'Неверный формат',
);

$.validator.addMethod('filessize', function (value, element, param) {
	let sum = 0;

	for (let index = 0; index < element.files.length; index++) {
		sum += element.files[index].size;
	}

	return this.optional(element) || sum <= param * 1000000;
}, 'Файлы не могут превышать {0} МБ');

$.validator.addMethod('filescount', function (value, element, param) {
	return this.optional(element) || element.files.length <= param;
}, 'Количество файлов не должно превышать {0} шт');

let app = {
	global: {
		init() {
			$('.js-goto').on('click', (e) => {
				let $target = $($(e.currentTarget).data('target') || $(e.currentTarget).attr('href'));

				if ($target.length) {
					e.preventDefault();
					window.scrollTo(0, $target.offset().top - 150);
				}
			});

			$document.on('click', '.js-toggle-class', (e) => {
				e.preventDefault();

				let options = $(e.currentTarget).data();

				switch (options.type) {
					case 'add':
						$html.addClass(options.class);
						break;
					case 'remove':
						$html.removeClass(options.class);
						break;
					case 'toggle':
						$html.toggleClass(options.class);
						break;
					default:
						$html.toggleClass(options.class);
						break;
				}
			});

			$('[data-fancybox]').fancybox({
				touch: false,
				autoFocus: false,
				backFocus: false,
				afterShow() {
					$('.fancybox-container:visible .swiper-container').each((index, item) => {
						const $item = $(item);

						if ($item.data('slider')) {
							$item.data('slider').update();
						}
					});
				}
			});

			$('head').append(`<style type="text/css">
				html {
					--compensate-scrollbar:${(window.innerWidth - document.documentElement.clientWidth) / -2}px;
				}
				</style>`);

			$body.css({
				'--width': $window.outerWidth(),
			});
			$window.on('resize', () => {
				$body.css({
					'--width': $window.outerWidth(),
				});
			});

			app.anime.init();
			app.loadMore.init();

			if (app.getURLParam($('.header__location__change').data('param'))) {
				localStorage.confirmLocation = 'yes';
			}

			if (localStorage.confirmLocation !== 'yes') {
				setTimeout(() => {
					$html.addClass('is-location-confirm');
				}, 2000);
			}

			$('.header__location__confirm__yes').on('click', (e) => {
				e.preventDefault();
				localStorage.confirmLocation = 'yes';
				$html.removeClass('is-location-confirm');
			});

			$('.header__location__confirm__no').on('click', (e) => {
				e.preventDefault();
				$html.removeClass('is-location-confirm');
				$html.addClass('is-location-change');
			});

			$('.header__location__current, .mobile-menu__location__current').on('click', (e) => {
				e.preventDefault();
				$html.removeClass('is-location-confirm');
				$html.toggleClass('is-location-change');
			});

			$document.on('click', (e) => {
				let $target = $(e.target);

				if (!$target.closest('.header__location').length && !$target.closest('.mobile-menu__location').length) {
					$html.removeClass('is-location-change');
				}
			});

			$document.on('click', '.js-link-return', (e) => {
				if (document.referrer) {
					e.preventDefault();
					history.back();
				}
			});

			app.analytics();

			$document.on('click', '.js-link', (e) => {
				let $this = $(e.currentTarget);

				e.preventDefault();
				if ($this.data('target') === '_blank') {
					window.open($this.data('href'), '_blank');
				} else {
					window.location = $this.data('href');
				}
			});

			$document.on('click', '.js-show-hide', (e) => {
				const $this = $(e.currentTarget);

				const $target = $($this.data('target'));

				e.preventDefault();
				$this.toggleClass('is-active');
				if ($this.hasClass('is-active')) {
					$this.text($this.data('on'));
					$target.removeClass('is-hidden');
				} else {
					$this.text($this.data('off'));
					$target.addClass('is-hidden');
				}
			});

			if ($window.outerWidth() < 1024 && $('.top-menu-list ul').length) {
				if ($('.top-menu-list ul li').hasClass('is-active')) {
					$window.on('load', () => {
						$('.top-menu-list ul').scrollLeft($('.top-menu-list ul li.is-active').offset().left - ($window.outerWidth() / 2 - $('.top-menu-list ul li.is-active').outerWidth() / 2));
					});
				}
			}
		},
	},
	getURLParam(param, url) {
		if (url) {
			return new URL(url).searchParams.get(param);
		}

		return new URL(window.location.href).searchParams.get(param);
	},
	vw(px) {
		const base = 1920;

		const baseMobile = 375;

		let output = px;

		if ($window.outerWidth() < 1920) {
			output = px / base * $window.outerWidth();
		}

		if ($window.outerWidth() < 1025) {
			output = px / baseMobile * $window.outerWidth();
		}

		return output;
	},
	anime: {
		init() {
			$('.anime').each((index, item) => {
				const $item = $(item);

				$item.on('inview', (event, isInView) => {
					if (isInView) {
						$item.addClass('animated');
						$item.off('inview');
					}
				});
			});
		},
	},
	scriptLoading(src, callback) {
		let script = document.createElement('script');
		let loaded;

		script.setAttribute('src', src);
		if (callback) {
			script.onreadystatechange = script.onload = () => {
				if (!loaded) {
					callback();
				}
				loaded = true;
			};
		}
		document.getElementsByTagName('head')[0].appendChild(script);
	},
	header: {
		init($header) {
			$header.find('.header__search-open').on('click', (e) => {
				e.preventDefault();
				e.stopPropagation();

				$html.addClass('is-show-search');
				setTimeout(() => {
					$header.find('.header__search__field').trigger('focus');
				}, 400);
			});

			$document.on('click', (e) => {
				let $target = $(e.target);

				if (!$target.closest('.header__search').length) {
					$html.removeClass('is-show-search');
				}
			});

			$header.find('.header__burger').on('click', () => {
				$html.toggleClass('is-show-mobile-menu');
			});
		},
	},
	selectLocation: {
		init($select) {
			$select.find('select').select2({
				dropdownParent: $select.find('.input__field'),
				minimumInputLength: 3,
				language: {
					noResults() {
						return 'Ничего не найдено';
					},
					inputTooShort(e) {
						return `Нужно ввести минимум ${e.minimum} буквы`;
					},
				},
				ajax: {
					url: $select.data('ajax'),
					dataType: 'json',
				},
			});

			$select.find('select').on('change', (e) => {
				window.location.href = $(e.currentTarget).val();
			});
		},
	},
	mobileMenu: {
		init($module) {
			$module.find('.mobile-menu__list__plus').on('click', (e) => {
				const $this = $(e.currentTarget);

				e.preventDefault();
				$this.toggleClass('is-active');
				if ($this.hasClass('is-active')) {
					$module.find('.mobile-menu__list__drop').stop().slideDown(400);
				} else {
					$module.find('.mobile-menu__list__drop').stop().slideUp(400);
				}
			});
		},
	},
	slider: {
		init($module) {
			if ($module.find('.swiper-slide').length < 2) {
				$module.find('.slider__pager').hide();
			}

			let slider = new Swiper($module.find('.swiper-container')[0], {
				slidesPerView: 1,
				spaceBetween: 0,
				allowTouchMove: $module.find('.swiper-slide').length < 2 ? false : true,
				pagination: {
					el: $module.find('.slider__pager')[0],
					clickable: true,
				},
			});

			slider.on('slideChange', () => {
				$module.removeClass('slider--dark');
				if ($(slider.slides[slider.realIndex]).data('mod') === 'dark') {
					$module.addClass('slider--dark');
				}
			});
		},
	},
	category: {
		init($module) {
			if (vars.isMobile()) {
				let slider = new Swiper($module.find('.swiper-container')[0], {
					slidesPerView: 'auto',
					spaceBetween: 1,
				});
			}
		},
	},
	objects: {
		init($module) {
			if (vars.isMobile()) {
				let slider = new Swiper($module.find('.swiper-container')[0], {
					slidesPerView: 'auto',
					spaceBetween: app.vw(16),
					breakpoints: {
						1024: {
							spaceBetween: 0,
						},
					},
				});
			}
		},
	},
	news: {
		init($module) {
			if (vars.isMobile()) {
				let slider = new Swiper($module.find('.swiper-container')[0], {
					slidesPerView: 'auto',
					spaceBetween: app.vw(16),
				});
			}
		},
	},
	footer: {
		init($module) {
			$module.find('.footer__catalog__label').on('click', (e) => {
				const $this = $(e.currentTarget);

				e.preventDefault();
				$this.toggleClass('is-active');
				if ($this.hasClass('is-active')) {
					$module.find('.footer__catalog__list').stop().slideDown(400);
				} else {
					$module.find('.footer__catalog__list').stop().slideUp(400);
				}
			});
		},
	},
	accordion: {
		init($module) {
			const $items = $module.find('.accordion__item');

			$module.find('.accordion__item__header').on('click', (e) => {
				const $this = $(e.currentTarget);

				const $item = $this.closest('.accordion__item');

				const $content = $item.find('.accordion__item__content');

				e.preventDefault();

				if ($item.hasClass('is-active')) {
					$item.removeClass('is-active');
					$content.slideUp(400);
				} else {
					const $activeItems = $items.filter('.is-active');

					$activeItems.removeClass('is-active');
					$activeItems.find('.accordion__item__content').slideUp(400);
					$item.addClass('is-active');
					$content.slideDown(400);
				}
			});
		},
	},
	tab: {
		init($tab) {
			$tab.find('> .tab__list > ul a').on('click', (e) => {
				let $this = $(e.currentTarget);

				let $target = $tab.find(`> .tab__content > .tab__item[data-tab="${$this.data('tab')}"]`);

				e.preventDefault();
				$tab.find('> .tab__list > ul a').removeClass('is-active');
				$tab.find('> .tab__content > .tab__item').removeClass('is-active');
				$this.addClass('is-active');
				$target.addClass('is-active');

				if(vars.isMobile()) {
					$tab.find('.tab__list ul').animate({
						scrollLeft: $this.offset().left - ($window.outerWidth() / 2 - $this.outerWidth() / 2) + $tab.find('.tab__list ul').scrollLeft(),
					}, 400);
				}
			});

			if (!$tab.find('> .tab__list > ul a.is-active').length) {
				$tab.find('> .tab__list > ul li:first-child a').trigger('click');
			}
		},
	},
	gallery: {
		init($gallery) {
			let thumbs = new Swiper($gallery.find('.gallery__thumbs .swiper-container')[0], {
				slidesPerView: 'auto',
				spaceBetween: 16,
			});
			let preview = new Swiper($gallery.find('.gallery__preview .swiper-container')[0], {
				slidesPerView: 1,
				spaceBetween: 8,
				navigation: {
					prevEl: $gallery.find('.arrow-prev')[0],
					nextEl: $gallery.find('.arrow-next')[0],
				},
				thumbs: {
					swiper: thumbs,
				},
			});

			$window.on('load', () => {
				thumbs.update();
				preview.update();
			});
		}
	},
	mask: {
		init($mask) {
			$mask.inputmask($mask.data('mask').toString(), {
				showMaskOnHover: false,
				clearIncomplete: true,
			});
		},
	},
	calendar: {
		init($input) {
			$input.attr('type', 'text');
			$input.inputmask('99.99.9999', {
				showMaskOnHover: false,
				clearIncomplete: true,
			});
			$input.datetimepicker({
				minDate: parseInt($input.data('limit'), 10) === -1 ? 0 : false,
				maxDate: parseInt($input.data('limit'), 10) === 1 ? 0 : false,
				timepicker: false,
				format: 'd.m.Y',
				scrollInput: false,
				dayOfWeekStart: 1,
			});
			$input.on('change', () => {
				try {
					$input.valid();
				} catch { }
			});
		},
	},
	select: {
		init($select) {
			$select.find('select').select2({
				minimumResultsForSearch: $select.data('search') ? 5 : Infinity,
				dropdownParent: $select.find('.input__field'),
				language: {
					noResults: function () {
						return "Ничего не найдено";
					}
				},
			});

			$select.find('select').on('change', () => {
				try {
					$select.find('select').valid();
				} catch {
				}
			});
		},
	},
	multipleFile: {
		init($multiple) {
			const $list = $multiple.find('.multiple-file__list');
			const $template = $multiple.find('.multiple-file__template');
			const max = parseInt($multiple.data('max'), 10);

			const addField = () => {
				if ($list.find('.multiple-file__item').length < max) {
					$list.prepend($template.html());

					$list.find('[data-validation]').each((index, item) => {
						$(item).rules('add', $(item).data('validation'));
					});
				}
			};

			$multiple.on('change', '.multiple-file__item__upload input', (e) => {
				const $this = $(e.currentTarget);
				const $item = $this.closest('.multiple-file__item');

				$item.removeClass('is-error');
				if (e.target.files.length) {
					if ($this.valid()) {
						$item.find('.multiple-file__item__file__name').text(e.target.files[0].name.split('.')[0]);
						$item.find('.multiple-file__item__file__info').text(`${e.target.files[0].name.split('.')[1].toUpperCase()}, ${parseFloat((e.target.files[0].size / 1000000).toFixed(2))} МБ`);
						$item.addClass('is-active');
						addField();
					}
				} else {
					$item.removeClass('is-active');
				}
			});

			$multiple.on('click', '.multiple-file__item__file__remove', (e) => {
				const count = $list.find('.multiple-file__item').length;
				const countActive = $list.find('.multiple-file__item.is-active').length;

				e.preventDefault();
				$(e.currentTarget).closest('.multiple-file__item').remove();

				if (countActive === max || count === 1) {
					addField();
				}
			});

			addField();
		},
	},
	form: {
		init($form) {
			const $searchInput = $form.find('.input__field--search input');

			$searchInput.on('keyup change', () => {
				if ($searchInput.val().trim()) {
					$form.addClass('is-filled');
				} else {
					$form.removeClass('is-filled');
				}
			});

			$form.find('.input__field__reset').on('click', (e) => {
				e.preventDefault();
				$searchInput.val('').trigger('change');
			});

			$form.find('.input__field__eye').on('click', (e) => {
				let $this = $(e.currentTarget);
				let $input = $this.closest('.input__field').find('input');

				e.preventDefault();
				if ($input.attr('type') === 'password') {
					$this.addClass('is-eye-view');
					$input.attr('type', 'text');
				} else {
					$this.removeClass('is-eye-view');
					$input.attr('type', 'password');
				}
			});

			let validator = $form.validate({
				lang: 'ru',
				rules: {},

				highlight(element, errorClass, validClass) {
					if (element.type === 'radio' || element.type === 'checkbox') {
						this.findByName(element.name).addClass(errorClass).removeClass(validClass);
					} else {
						$(element).addClass(errorClass).removeClass(validClass);
					}
				},

				unhighlight(element, errorClass, validClass) {
					if (element.type === 'radio' || element.type === 'checkbox') {
						this.findByName(element.name).removeClass(errorClass).addClass(validClass);
					} else {
						$(element).removeClass(errorClass).addClass(validClass);
					}
				},

				submitHandler(form) {
					if ($form.data('type') === 'submit') {
						form.submit();
					} else {
						let preparedData;
						let processData;
						let contentType;

						$form.removeClass('is-sended is-error');

						$form.find('.form__button .button').addClass('is-loading');

						$.ajax({
							type: $form.attr('method'),
							url: $form.attr('action'),
							data: preparedData ? preparedData : $form.serialize(),
							dataType: 'json',
							processData,
							contentType,
							success(result) {
								if (result.result === true) {
									$form[0].reset();
									if ($form.closest('[data-app="modal-bid"]').length) {
										$form.find('.swiper-container')[0].swiper.slideTo(0);
									}
									$.fancybox.close();

									if ($form.data('event')) {
										dataLayer.push({
											event: $form.data('event'),
											eventCategory: $form.data('event'),
											eventAction: 'send',
										});
									}

									if ($form.data('event-label')) {
										dataLayer.push({
											event: $form.data('event-label'),
											eventCategory: $form.data('event-label'),
											eventAction: 'send',
											eventLabel: $form.closest('.modal-bid__row').find('.modal-bid__title').text(),
										});
									}
								}
								$.fancybox.open(`<div class="modal modal--alert">
									<div class="h3 form__title">${result.title}</div>
									<div class="form__text">${result.message}</div>
								</div>`, {
									touch: false,
									autoFocus: false,
								});
								$form.find('.form__button .button').removeClass('is-loading');
							},
						});
					}
				},
			});

			setTimeout(() => {
				$form.find('[data-validation]').each((index, item) => {
					$(item).rules('add', $(item).data('validation'));
				});
			}, 1000);
		},
	},
	becomePartner: {
		init($module) {
			if (!vars.isMobile()) {
				let $text = $module.find('.become-partner__text');

				$module.find('.become-partner__links a').hover(
					(e) => {
						$text.removeClass('is-active');
						$text.eq($(e.currentTarget).closest('li').index() + 1).addClass('is-active');
					},
					() => {
						$text.removeClass('is-active');
						$text.eq(0).addClass('is-active');
					},
				);
			}
		},
	},
	dealers: {
		init($module) {
			let $map = $module.find('.dealers__map');

			let options = $map.data();

			let $mapList = $module.find('.dealers__map-list');

			let map = null;

			let $city = $module.find('.js-city');

			let inited = false;

			let setMarkers = (markers) => {
				map.geoObjects.removeAll();

				$module.find('.dealers__map-item').each((index, item) => {
					let $item = $(item);
					let marker = new ymaps.Placemark([parseFloat($item.data('lat')), parseFloat($item.data('lng'))], {}, {
						iconLayout: 'default#image',
						iconImageHref: options.icon,
						iconImageSize: [16, 16],
						iconImageOffset: [-8, -8],
					});

					marker.events.add('click', () => {
						$module.find('.dealers__map-item').removeClass('is-active');
						$item.addClass('is-active');
					});

					map.geoObjects.add(marker);
				});

				if (map.geoObjects.getBounds()) {
					map.setBounds(map.geoObjects.getBounds());
				}

				if (map.getZoom() > 16) {
					map.setZoom(16);
				}
			};

			let getMarkers = () => {
				$.ajax({
					type: 'get',
					url: $module.data('ajax'),
					data: {
						city: $city.val(),
					},
					dataType: 'json',
					success(response) {
						$module.find('.dealers__map-list').html(response.list);
						setMarkers(response);
					},
				});
			};

			let init = () => {
				app.scriptLoading('//api-maps.yandex.ru/2.1/?lang=ru_RU', () => {
					ymaps.ready(() => {
						map = new ymaps.Map($map[0], {
							center: [options.lat, options.lng],
							zoom: 16,
							controls: ['zoomControl'],
						}, {});
						getMarkers();

						$city.on('change', () => {
							getMarkers();
						});
					});
				});
			}

			$module.on('inview', (event, isInView) => {
				if (isInView && !inited) {
					init();
					inited = true;
				}
			});

			$module.on('click', '.dealers__map-item__close', (e) => {
				e.preventDefault();
				$(e.currentTarget).closest('.dealers__map-item').removeClass('is-active');
			});
		},
	},
	topMenu: {
		init($menu) {
			let slider = new Swiper($menu.find('.swiper-container')[0], {
				slidesPerView: 'auto',
				freeMode: true,
				resistance: true,
				resistanceRatio: 0,
				breakpoints: {
					1024: {
						allowTouchMove: false,
					},
				},
			});

			if (vars.isMobile()) {
				$menu.find('.top-menu__item__arrow').on('click', (e) => {
					let $this = $(e.currentTarget);
					let $item = $this.closest('.top-menu__item');

					e.preventDefault();
					if ($item.hasClass('is-active')) {
						$item.removeClass('is-active');
					} else {
						$menu.find('.top-menu__item').removeClass('is-active');
						$item.addClass('is-active');
					}
				})

				$document.on('click', (e) => {
					let $target = $(e.target);

					if (!$target.closest('.top-menu__item').length) {
						$menu.find('.top-menu__item').removeClass('is-active');
					}
				});
			}

			$window.on('load', () => {
				slider.update();
			});
		}
	},
	householdSlider: {
		init($module) {
			let slider = new Swiper($module.find('.swiper-container')[0], {
				slidesPerView: 1,
				navigation: {
					prevEl: $module.find('.arrow-prev')[0],
					nextEl: $module.find('.arrow-next')[0],
				},
			});
		},
	},
	productInfo: {
		init($module) {
			const fixed = false;
			const $fixedItem = $module.find('.page-product__info__fixed');
			const $content = $module.find('.page-product__info__content');

			$window.on('scroll', () => {
				if ($window.scrollTop() > $content.offset().top + $content.outerHeight()) {
					$fixedItem.addClass('is-fixed');
				} else {
					$fixedItem.removeClass('is-fixed');
				}
			});
		},
	},
	productSlider: {
		init($module) {
			let slider = new Swiper($module.find('.swiper-container')[0], {
				slidesPerView: 1,
				spaceBetween: app.vw(12),
				breakpoints: {
					1024: {
						slidesPerView: 4,
						spaceBetween: app.vw(20),
					},
				},
				navigation: {
					prevEl: $module.find('.arrow-prev')[0],
					nextEl: $module.find('.arrow-next')[0],
				},
			});
		},
	},
	// search: {
	// 	init($module) {
	// 		const $fieldInput = $module.find('.input__field--search input');
	//
	// 		$fieldInput.on('keyup change', () => {
	// 			if ($fieldInput.val().trim()) {
	// 				$module.addClass('is-filled');
	// 			} else {
	// 				$module.removeClass('is-filled');
	// 			}
	// 		});
	//
	// 		$module.find('.input__field__reset').on('click', (e) => {
	// 			e.preventDefault();
	// 			$fieldInput.val('').trigger('change');
	// 		});
	// 	},
	// },
	seriesSlider: {
		init($module) {
			let slider = new Swiper($module.find('.swiper-container')[0], {
				slidesPerView: 1,
				spaceBetween: app.vw(10),
				loop: true,
				breakpoints: {
					1024: {
						slidesPerView: 'auto',
						spaceBetween: app.vw(35),
					},
				},
				navigation: {
					prevEl: $module.find('.arrow-prev')[0],
					nextEl: $module.find('.arrow-next')[0],
				},
			});
		},
	},
	seriesTag: {
		init($module) {
			$window.on('scroll', () => {
				if ($window.scrollTop() > $module.offset().top + $module.outerHeight()) {
					$module.addClass('is-fixed');
				} else {
					$module.removeClass('is-fixed');
				}
			});
		},
	},
	buyers: {
		init($module) {
			let $map = $module.find('.page-buyers__map');
			let options = $map.data();
			let $filter = $module.find('.page-buyers__filter');
			let $mapList = $module.find('.page-buyers__map-list');
			let $list = $module.find('.page-buyers__list__row');
			let map = null;
			let markers = [];

			const loadData = () => {
				if (!$module.hasClass('is-loading')) {
					$module.addClass('is-loading');
					$.ajax({
						type: $filter.attr('method'),
						url: $filter.attr('action'),
						data: $filter.serialize(),
						dataType: 'json',
						success(response) {
							$mapList.html(response['map-list']);
							$list.html(response.list);
							setMarkers();
							$module.removeClass('is-loading');
						},
					});
				}
			};

			let setMarkers = () => {
				map.geoObjects.removeAll();

				markers = [];

				$module.find('.page-buyers__map-item').each((index, item) => {
					let $item = $(item);

					let marker = new ymaps.Placemark([parseFloat($item.data('lat')), parseFloat($item.data('lng'))], {}, {
						iconLayout: 'default#image',
						iconImageHref: options.pin,
						iconImageSize: [16, 16],
						iconImageOffset: [-8, -8],
					});

					markers.push(marker);

					marker.events.add('click', () => {
						markers.forEach((markerItem) => {
							markerItem.options.set('iconImageHref', options.pin);
							markerItem.options.set('iconImageSize', [16, 16]);
							markerItem.options.set('iconImageOffset', [-8, -8]);
						});
						$module.find('.page-buyers__map-item').removeClass('is-active');
						$item.addClass('is-active');
						marker.options.set('iconImageHref', options.pinActive);
						marker.options.set('iconImageSize', [32, 32]);
						marker.options.set('iconImageOffset', [-16, -16]);
					});

					marker.events.add('mouseenter', () => {
						marker.options.set('iconImageHref', options.pinActive);
						marker.options.set('iconImageSize', [32, 32]);
						marker.options.set('iconImageOffset', [-16, -16]);
					});

					marker.events.add('mouseleave', () => {
						if (!$item.hasClass('is-active')) {
							marker.options.set('iconImageHref', options.pin);
							marker.options.set('iconImageSize', [16, 16]);
							marker.options.set('iconImageOffset', [-8, -8]);
						}
					});

					map.geoObjects.add(marker);
				});

				if (map.geoObjects.getBounds()) {
					map.setBounds(map.geoObjects.getBounds());
				}

				if (map.getZoom() > 16) {
					map.setZoom(16);
				}
			};

			app.scriptLoading('//api-maps.yandex.ru/2.1/?lang=ru_RU', () => {
				ymaps.ready(() => {
					map = new ymaps.Map($map[0], {
						center: [parseFloat(options.lat), parseFloat(options.lng)],
						zoom: 13,
						controls: ['zoomControl'],
					}, {});

					$map.data('map', map);
					loadData();
				});
			});

			$module.on('click', '.page-buyers__map-item__close', (e) => {
				e.preventDefault();
				$(e.currentTarget).closest('.page-buyers__map-item').removeClass('is-active');
				markers.forEach((markerItem) => {
					markerItem.options.set('iconImageHref', options.pin);
					markerItem.options.set('iconImageSize', [16, 16]);
					markerItem.options.set('iconImageOffset', [-8, -8]);
				});
			});

			$('.page-buyers__filter__type a').on('click', (e) => {
				let $this = $(e.currentTarget);

				e.preventDefault();

				$('.page-buyers__filter__type a').removeClass('is-active');
				$this.addClass('is-active');
				$module.find('.page-buyers__map-item').removeClass('is-active');
				markers.forEach((markerItem) => {
					markerItem.options.set('iconImageHref', options.pin);
					markerItem.options.set('iconImageSize', [16, 16]);
					markerItem.options.set('iconImageOffset', [-8, -8]);
				});
				$module.removeClass('is-show-list');
				$module.addClass($this.data('target'));

				if ($this.data('target') === "is-show-list") {
					setTimeout(() => {
						if (map.geoObjects.getBounds()) {
							map.setBounds(map.geoObjects.getBounds());
						}
					}, 250);
				}
			});

			$filter.on('change', (e) => {
				loadData();
			});

			$module.find('.page-buyers__type a').on('click', (e) => {
				const $this = $(e.currentTarget);

				e.preventDefault();
				$module.find('.page-buyers__type a').removeClass('is-active');
				$this.addClass('is-active');
				$module.find('.js-filter-type').val($this.data('type')).trigger('change');
			});
		},
	},
	modalBid: {
		init($module) {
			let form = new Swiper($module.find('.modal-bid__form .swiper-container')[0], {
				allowTouchMove: false,
				autoHeight: true,
				breakpoints: {
					1024: {
						autoHeight: false,
					},
				},
			});

			form.on('slideChange', () => {
				if (form.activeIndex > 0) {
					$module.find('.modal-bid__text__hidden').removeClass('is-hidden');
				}
			});

			$module.find('.modal-bid__form__item__next').on('click', (e) => {
				let $required = $(e.currentTarget).closest('.modal-bid__form__item').find('[required]');

				e.preventDefault();
				if ($required.length === 0 || $(e.currentTarget).closest('.modal-bid__form__item').find('[required]').valid()) {
					form.slideNext();

					if (vars.isMobile()) {
						$module.closest('.fancybox-slide').animate({
							scrollTop: 0,
						}, 400);
					}
				}
				form.update();
			});

			$module.find('.modal-bid__form__item__back').on('click', (e) => {
				e.preventDefault();
				form.slidePrev();
			});

			$module.find('.modal-bid__form').on('change', () => {
				form.update();
			})

			$module.find('.modal-bid__form__item__send').on('click', () => {
				setTimeout(() => {
					form.update();
				}, 100)
			})

			$module.find('.swiper-container').data('slider', form)
		},
	},
	serviceDetail: {
		init($module) {
			let $map = $module.find('.page-service-detail__map');
			let options = $map.data();
			let $filter = $module.find('.page-service-detail__filter');
			let $mapList = $module.find('.page-service-detail__map-list');
			let $list = $module.find('.page-service-detail__list');
			let map = null;
			let markers = [];

			let setMarker = (marker, active = false) => {
				if (marker.options.pin) {
					marker.options.set('iconImageHref', marker.options.pin.image);
					marker.options.set('iconImageSize', [marker.options.pin.w, marker.options.pin.h]);
					marker.options.set('iconImageOffset', [-marker.options.pin.w / 2, -marker.options.pin.h]);
				} else if (active) {
					marker.options.set('iconImageHref', options.pinActive);
					marker.options.set('iconImageSize', [47, 47]);
					marker.options.set('iconImageOffset', [-24, -24]);
				} else {
					marker.options.set('iconImageHref', options.pin);
					marker.options.set('iconImageSize', [40, 40]);
					marker.options.set('iconImageOffset', [-20, -20]);
				}
			};

			let setMarkers = () => {
				map.geoObjects.removeAll();

				markers = [];

				$module.find('.page-service-detail__map-item').each((index, item) => {
					let $item = $(item);
					let marker = new ymaps.Placemark([parseFloat($item.data('lat')), parseFloat($item.data('lng'))], {}, {
						iconLayout: 'default#image',
						iconImageHref: options.pin,
						iconImageSize: [40, 40],
						iconImageOffset: [-20, -20],
					});

					markers.push(marker);

					marker.events.add('click', () => {
						markers.forEach((markerItem) => {
							if ($item.data('type') !== 'main') {
								setMarker(markerItem);
							}
						});
						$module.find('.page-service-detail__map-item').removeClass('is-active');
						$item.addClass('is-active');
						if ($item.data('type') !== 'main') {
							setMarker(marker, true);
						}
					});

					marker.events.add('mouseenter', () => {
						if ($item.data('type') !== 'main') {
							setMarker(marker, true);
						}
					});

					marker.events.add('mouseleave', () => {
						if (!$item.hasClass('is-active') && $item.data('type') !== 'main') {
							setMarker(marker);
						}
					});

					map.geoObjects.add(marker);
				});

				if (map.geoObjects.getBounds()) {
					map.setBounds(map.geoObjects.getBounds());
				}

				if (map.getZoom() > 16) {
					map.setZoom(16);
				}
			};

			app.scriptLoading('//api-maps.yandex.ru/2.1/?lang=ru_RU', () => {
				ymaps.ready(() => {
					map = new ymaps.Map($map[0], {
						center: [55.755829, 37.617627],
						zoom: 6,
						controls: ['zoomControl'],
					}, {});

					setMarkers();

					$map.data('map', map);
				});
			});

			$module.on('click', '.page-service-detail__map-item__close', (e) => {
				e.preventDefault();
				$(e.currentTarget).closest('.page-service-detail__map-item').removeClass('is-active');
				markers.forEach((markerItem) => {
					setMarker(markerItem);
				});
			});

			$module.find('.page-service-detail__filter__type a').on('click', (e) => {
				let $this = $(e.currentTarget);

				e.preventDefault();
				$this.toggleClass('is-active');
				$module.find('.page-service-detail__map-item').removeClass('is-active');
				markers.forEach((markerItem) => {
					setMarker(markerItem);
				});
				if ($this.hasClass('is-active')) {
					$module.addClass('is-show-list');
					$this.text($this.data('on'));
				} else {
					$module.removeClass('is-show-list');
					$this.text($this.data('off'));
					setTimeout(() => {
						if (map.geoObjects.getBounds()) {
							map.setBounds(map.geoObjects.getBounds());
						}
					}, 250);
				}
			});

			$filter.on('change', () => {
				if (!$module.hasClass('is-loading')) {
					$module.addClass('is-loading');
					$.ajax({
						type: $filter.attr('method'),
						url: $filter.attr('action'),
						data: $filter.serialize(),
						dataType: 'json',
						success(response) {
							$list.html('');
							$mapList.html(response['map-list']);
							if (response.message) {
								$list.append(response.message);
							}
							$list.append(response.list);
							if (map) {
								setMarkers();
							}
							$module.removeClass('is-loading');
						},
					});
				}
			}).trigger('change');

			$module.on('click', '.js-set-city', (e) => {
				e.preventDefault();

				$module.find('[name="city"]').val($(e.currentTarget).data('value')).trigger('change');
				// $filter.trigger('change');
			});
		},
	},
	loadMore: {
		init() {
			if (window.loadMore === 'inited') {
				return false;
			}

			$('[data-list]').each((index, list) => {
				const $list = $(list);

				if ($list.data('ajax')) {
					$.ajax({
						type: 'get',
						url: $list.data('ajax'),
						data: $list.data('target-filter') ? $(`[data-filter="${$list.data('target-filter')}"]`).serialize() : '',
						success(response) {
							$list.html(response);
						},
					});

					if ($list.data('target-filter')) {
						$(`[data-filter="${$list.data('target-filter')}"]`).on('change submit', (e) => {
							e.preventDefault();
							$.ajax({
								type: 'get',
								url: $list.data('ajax'),
								data: $(`[data-filter="${$list.data('target-filter')}"]`).serialize(),
								success(response) {
									$list.html(response);
								},
							});
						});
					}
				}
			});

			$document.on('click', '.js-load-more a', (e) => {
				const $this = $(e.currentTarget);
				const $parent = $this.closest('.js-load-more');
				const $list = $(`[data-list="${$parent.data('target')}"]`);
				const offsetTop = $parent.offset().top;

				let data = `page=${$this.data('page')}`;

				if ($list.data('target-filter')) {
					data = $(`[data-filter="${$list.data('target-filter')}"]`).serialize() + '&' + data;
				}

				e.preventDefault();
				if (!$this.hasClass('is-loading')) {
					$this.addClass('is-loading');
					$.ajax({
						type: 'get',
						url: $list.data('ajax'),
						data: data,
						success(response) {
							$parent.remove();
							if ($parent.data('type') === 'replace') {
								$list.html(response);
								window.scrollTo(0, $list.offset().top - 125);
							} else {
								$list.append(response);
								window.scrollTo(0, offsetTop - 125);
							}
						},
					});
				}
			});

			$document.on('click', '.js-filter-reset', (e) => {
				const $this = $(e.currentTarget);
				const $filter = $(`[data-filter="${$this.data('target-filter')}"]`);

				e.preventDefault();
				$filter[0].reset();
				if ($filter.find('select').length) {
					$filter.find('select').trigger('change');
				} else {
					$filter.trigger('change');
				}
			});

			window.loadMore = 'inited';
		},
	},
	up: {
		init($up) {
			$window.on('scroll.up', () => {
				if ($window.scrollTop() > $window.outerHeight()) {
					$up.addClass('is-show');
				} else {
					$up.removeClass('is-show');
				}
			}).trigger('scroll.up');

			$up.on('click', (e) => {
				e.preventDefault();
				window.scrollTo(0, 0);
			});
		},
	},
	cookies: {
		init($cookie) {
			if (localStorage.cookiesAgree !== 'yes') {
				setTimeout(() => {
					$cookie.fadeIn(250);
				}, 2000);
			}
			$cookie.find('.cookies__button .button').on('click', (e) => {
				e.preventDefault();
				localStorage.cookiesAgree = 'yes';
				$cookie.fadeOut(250);
			});
		},
	},
	cursor: {
		init($module) {
			if ($module.is(':visible')) {

				let $window = $(window);

				$document.on('mousemove', function (e) {
					let cursorX = e.clientX + document.documentElement.scrollLeft;

					if (cursorX + $('.cursor').outerWidth() > $window.outerWidth()) {
						cursorX = $window.outerWidth() - $('.cursor').outerWidth();
					}

					$('.cursor').show().css({
						'left': cursorX,
						'top': e.clientY,
					});
				}).on('mouseleave', function () {
					$('.cursor').hide();
				});

				// $(selector).on('mouseenter', function () {
				// 	$('.cursor__circle').css({ 'transform': 'scale(3.4)', 'opacity': '0.5' });
				// }).on('mouseleave', function () {
				// 	$('.cursor__circle').css({ 'transform': 'none', 'opacity': 1 });
				// });
			}
		},
	},
	analytics() {
		$document.on('click', '.event-phone', (e) => {
			if (typeof dataLayer !== 'undefined') {
				dataLayer.push({
					event: 'Phone',
					eventCategory: 'Phone',
					eventAction: 'click',
					eventLabel: $(e.currentTarget).attr('href').replace('tel:', ''),
				});
			}
		});

		$document.on('click', '.event-email', (e) => {
			if (typeof dataLayer !== 'undefined') {
				dataLayer.push({
					event: 'Email',
					eventCategory: 'Email',
					eventAction: 'click',
					eventLabel: $(e.currentTarget).attr('href').replace('mailto:', ''),
				});
			}
		});

		$document.on('click', '.event-link', (e) => {
			if (typeof dataLayer !== 'undefined') {
				dataLayer.push({
					event: 'Link',
					eventCategory: 'Link',
					eventAction: 'click',
					eventLabel: $(e.currentTarget).attr('href'),
				});
			}
		});

		$document.on('click', '.event-registration', () => {
			if (typeof dataLayer !== 'undefined') {
				dataLayer.push({
					event: 'Registration',
					eventCategory: 'Registration',
					eventAction: 'click',
				});
			}
		});

		$document.on('click', '.event-site', (e) => {
			if (typeof dataLayer !== 'undefined') {
				dataLayer.push({
					event: 'Site',
					eventCategory: 'Site',
					eventAction: 'click',
					eventLabel: $(e.currentTarget).attr('href'),
				});
			}
		});

		$document.on('click', '.event-document', (e) => {
			if (typeof dataLayer !== 'undefined') {
				dataLayer.push({
					event: 'Document',
					eventCategory: 'Document',
					eventAction: 'click',
					eventLabel: $(e.currentTarget).find('.file__name').text().trim(),
				});
			}
		});

		$document.on('click', '.event-video', (e) => {
			if (typeof dataLayer !== 'undefined') {
				dataLayer.push({
					event: 'Video',
					eventCategory: 'Video',
					eventAction: 'click',
					eventLabel: $(e.currentTarget).closest('.page-series__intro').find('.page-series__intro__title span').text().trim(),
				});
			}
		});
	},
};

app.global.init();

window.initApps = () => {
	$('[data-app]').each((index, item) => {
		let $this = $(item);
		let split = $this.data('app').split('||');

		$.each(split, (appIndex, appName) => {
			let appNameCamel = false;

			if (appName.indexOf('-') !== -1) {
				appNameCamel = appName.replace(/(-|\s)(\S)/ug, (m) => m.toUpperCase()).replace(/-/ug, '');
			}

			if (app[appName] && $this.data(`${appName}-init`) !== true) {
				app[appName].init($this);
				$this.data(`${appName}-init`, true);
			} else if (app[appNameCamel] && $this.data(`${appName}-init`) !== true) {
				app[appNameCamel].init($this);
				$this.data(`${appName}-init`, true);
			}
		});
	});
};

initApps();

