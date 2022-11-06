const textContrast = bgColor => {
  let textColor = '--gwds__color--white';
  switch (bgColor) {
    case 'black':
      textColor = '--gwds__color--white';
      break;
    case 'white':
      textColor = '--gwds__color--black';
      break;
    case 'black-opacity':
      textColor = '--gwds__color--white';
      break;
    case 'dark-900':
      textColor = '--gwds__color--white';
      break;
    case 'dark-800':
      textColor = '--gwds__color--white';
      break;
    case 'dark-700':
      textColor = '--gwds__color--white';
      break;
    case 'dark-500':
      textColor = '--gwds__color--black';
      break;
    case 'dark-400':
      textColor = '--gwds__color--black';
      break;
    case 'dark-300':
      textColor = '--gwds__color--black';
      break;
    case 'dark-200':
      textColor = '--gwds__color--black';
      break;
    case 'dark-100':
      textColor = '--gwds__color--black';
      break;
    case 'green-900':
      textColor = '--gwds__color--white';
      break;
    case 'orange-400':
      textColor = '--gwds__color--white';
      break;
    case 'violet-500':
      textColor = '--gwds__color--white';
      break;
    case 'violet-300':
      textColor = '--gwds__color--black';
      break;
    case 'blue-400':
      textColor = '--gwds__color--white';
      break;
    case 'blue-900':
      textColor = '--gwds__color--white';
      break;
    case 'turquoise-200':
      textColor = '--gwds__color--black';
      break;
    case 'purple-400':
      textColor = '--gwds__color--white';
      break;
    case 'purple-900':
      textColor = '--gwds__color--white';
      break;
    case 'red-200':
      textColor = '--gwds__color--black';
      break;
    case 'red-400':
      textColor = '--gwds__color--white';
      break;
    case 'red-50':
      textColor = '--gwds__color--black';
      break;
    case 'fuchsia-500':
      textColor = '--gwds__color--black';
      break;
    case 'fuchsia-700':
      textColor = '--gwds__color--white';
      break;
    case 'violet-50':
      textColor = '--gwds__color--black';
      break;
    case 'blue-50':
      textColor = '--gwds__color--black';
      break;
    case 'orange-50':
      textColor = '---gwds__color--black';
      break;
    case 'green-50':
      textColor = '--gwds__color--black';
      break;
    //LIVE 2022
    case 'yellow-live':
      textColor = '--gwds__color--black';
      break;
    case 'red-live':
      textColor = '--gwds__color--black';
      break;
    case 'gray-live':
      textColor = '--gwds__color--black';
      break;
    case 'purple-live':
      textColor = '--gwds__color--black';
      break;
    case 'blue-live':
      textColor = '--gwds__color--black';
      break;
    case 'green-live':
      textColor = '--gwds__color--black';
      break;
    case 'black-live':
      textColor = '--gwds__color--white';
      break;
    default:
      textColor = '--gwds__color--black';
  }
  return textColor;
};

export default textContrast;
