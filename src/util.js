function getPrefix(name, isExport = false) {
  return `${isExport ? 'export ' : ''}interface ${name}{\n`
}

function toCamelCase(str = '') {
  return str.replace(/(-|_)([a-z])/g, function (g) {
    return g[1].toUpperCase()
  })
}

function upperFirstLetter(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function pad(num = 2) {
  return ' '.repeat(num)
}

function getFullObjectFromArray(arr = []) {
  if (arr.length === 0) {
    return {}
  } else {
    if (typeof arr[0] !== 'object') {
      return arr[0]
    } else {
      return arr.reduce((pre, next) => {
        return Object.assign(pre, next)
      }, {})
    }
  }
}

/**
 * @returns {string} interface string content
 * @param {string} jsonString
 */
function transformJSON(obj, config) {
  let result = ''
  let subs = ''
  const padContent = pad(config.outputIndent)
  Object.keys(obj).forEach((key) => {
    const val = obj[key]
    if (typeof val !== 'object') {
      result += `${padContent}${key}: ${typeof val};\n`
    } else if (Array.isArray(val)) {
      // array
      if (val.length === 0) {
        result += `${padContent}${key}: any[];\n`
      } else {
        const fullObject = getFullObjectFromArray(val)
        if (typeof fullObject === 'object') {
          const propName = `${upperFirstLetter(toCamelCase(key))}Item`
          result += `${padContent}${key}: ${propName}[];\n`
          const sub = transform(fullObject, {
            ...config,
            rootName: propName,
          })
          subs += `${sub}`
        } else {
          // primitive value as item
          result += `${padContent}${key}: ${typeof fullObject}[];\n`
        }
      }
    } else {
      if (val == null) {
        const propName = upperFirstLetter(toCamelCase(key))
        result += `${padContent}${key}: string;\n`
      } else {
        // object
        const propName = upperFirstLetter(toCamelCase(key))
        result += `${padContent}${key}: ${propName};\n`
        const sub = transform(val, {
          ...config,
          rootName: propName,
        })
        subs += `${sub}`
      }
    }
  })
  return [result, subs]
}

const defaultConfig = {
  outputIndent: 2,
  exportRoot: true,
  rootName: 'RenameMe',
}

export function transform(obj = {}, config = {}, isRoot = false) {
  if (Array.isArray(obj)) {
    return `Array value must belong to some key`
  }
  const mergedConfig = {
    ...defaultConfig,
    ...config,
  }
  const prefix = getPrefix(
    mergedConfig.rootName,
    isRoot && mergedConfig.exportRoot
  )
  const [content, subContent] = transformJSON(obj, mergedConfig)
  const suffix = '}'
  return `${subContent}${prefix}${content}${suffix}\n\n`
}

// refer from stackoverflow: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement('textarea')
  textArea.value = text

  // Avoid scrolling to bottom
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    var successful = document.execCommand('copy')
    var msg = successful ? 'successful' : 'unsuccessful'
    alert('Copied')
  } catch (err) {
    alert('Copied Failed, error: ' + error)
  }

  document.body.removeChild(textArea)
}

export function copyTextToClipboard(text) {
  if (!text) return
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text)
    return
  }
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert('Copied')
    })
    .catch((err) => alert('Copied Failed, error: ' + error))
}
