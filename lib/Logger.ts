const Logger = {
  debug: (message?: any, ...optionalParams: any[]): void => {
    if (process.env.ENV != "production") {
      console.log(message, optionalParams);
    }
  },
  error: (message?: any, ...optionalParams: any[]): void => {
    if (process.env.ENV != "production") {
      console.log(message, optionalParams);
    }
  }
}

export default Logger;