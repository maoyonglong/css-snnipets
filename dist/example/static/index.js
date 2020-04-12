$(function () {
  function getBrowserInfo(){
    var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var re =/(msie|firefox|chrome|opera|version).*?([\d.]+)/;
    var m = ua.match(re);
    Sys.browser = m[1].replace(/version/, "'safari");
    Sys.version = m[2];
    return Sys;
  }

  var browserInfo = getBrowserInfo()
  if (browserInfo.browser === 'msie') {
    var IEVersion = parseInt(browserInfo.version)

    if (IEVersion === 8) {
      var className = document.body.className

      document.body.className = className ? className.trim() + ' ' : '' + 'ie8'
    }
  }

  String.prototype.noBlank = function () {
    return this.replace(/\s+/g, '')
  }

  String.prototype.noSpace = function () {
    return this.replace(/ /g, '')
  }

  String.prototype.noLineSpace = function () {
    var str = ''

    this.split('\n').forEach(function (v, i) {
      str += v.trim() + '\n'
    })

    return str.substring(0, str.length - 1)
  }

  Object.prototype.getPropertyByPath = function (p) {
    var parts = p.split('.')
    var target = this
    
    try {
      parts.forEach(function (part) {
        target = target[part]
      })
    } catch (e) {
      target = null
    }

    return target
  }

  function mergeOption (tarOptions, defOptions) {
    tarOptions = tarOptions || {}
    defOptions = defOptions || {}

    return $.extend(true, {}, defOptions, tarOptions)
  }

  $.fn.extend({
    active: function (options, cb) {
      var defOptions = {
        activeClass: 'active',
        // otherClass: undefined, // siblings other class
        // $other: undefined // or jQuery elements $other
      }

      options = mergeOption(options, defOptions)

      var $other = options.$other || this.siblings(options.otherClass)
      var activeClass = options.activeClass

      if (this.hasClass(activeClass)) return

      $other.removeClass(activeClass)
      this.addClass(activeClass)

      if (cb) {
        cb.call(this[0], options, $other)
      }

      return this
    }
  })

  var $copyInput = $('#copyInput')
  var workspace = {}

  function normalizeHref (href) {
    if (href.indexOf('#') < 0) {
      href = '#' + href
    }

    return href
  }

  $('[data-copy]').on('click', function (e) {
    var $code = $(this).parent().parent().find('code')
    var codeStr = $code.text().noBlank()
    
    $copyInput.attr('value', codeStr)
    $copyInput.select()
    document.execCommand('copy')
  })

  workspace.toggleCodeCopyBtn = function (visible) {
    $(this).text(visible ? '点击隐藏代码' : '点击展开代码')
  }
  workspace.toggleNav = function (visible, nav) {
    var activeClass = visible ? 'In' : 'Out'
    var removeClass = visible ? 'Out' : 'In'
    var toggleClass = 'hidden'
    var $nav = $(nav)

    function genClass (c) {
      return 'slide' + c + 'Left'
    }

    if (visible) {
      $nav.toggleClass(toggleClass)
    } else {
      setTimeout(function () {
        $nav.toggleClass(toggleClass)
      }, 1000)
    }
    $nav.removeClass(genClass(removeClass))
      .addClass(genClass(activeClass))
  }
  $('[data-toggle]').on('click', function (e) {
    var $toggle = $(this)
    var href = $toggle.data('toggle')
    var cbPath = $toggle.data('toggle-cb')
    var toggleClass = $toggle.data('toggle-class')
    var custom = $toggle.data('toggle-custom')
    var $hrefTarget
    var visible

    if (href) {
      href = normalizeHref(href)

      $hrefTarget = $(href)

      visible = $hrefTarget.css('display') !== 'none'

      if (!custom) {
        if (toggleClass) {
          $hrefTarget.toggleClass(toggleClass)
        } else {
          $hrefTarget.css('display', visible ? 'none' : 'block')
        }
      }
    }

    if (href && cbPath) {
      var cb = workspace.getPropertyByPath(cbPath)

      if (cb !== null) {
        cb.call(this, !visible, $hrefTarget[0])
      }
    }
  })
  $('[data-href]').on('click', function () {
    var $this = $(this)
    var href = $this.data('href')
    var wrap = $this.data('href-wrap')

    if (href) {
      href = normalizeHref(href)

      var $hrefTarget = $(href)
      var top = $hrefTarget.offset().top
      var scrollTop = $hrefTarget.scrollTop()
      var $wrapTarget

      if (wrap) {
        wrap = normalizeHref(wrap)
        $wrapTarget = $(wrap)
      } else {
        $wrapTarget = window
      }

      $wrapTarget.scrollTop(top + scrollTop)
    }
  })

  var $code = $('pre code')

  $code.each(function (i, block) {
    var $block = $(block)

    $block.text(HTMLFormat($block.html()))
    hljs.highlightBlock(block);
  })

  $('[data-snnipet]').on('click', function () {
    var $codeWrap = $(this).parent().parent()
    var $code = $codeWrap.find('code')
    var editable = $code.attr('contenteditable') === 'true'

    $code.attr('contenteditable', !editable)

    if (editable) {
      var codeStr = $code.text()
      var $result = $codeWrap.parent().prev()

      $result.html(codeStr)
    } else {
      $code[0].focus()
    }
  })
})