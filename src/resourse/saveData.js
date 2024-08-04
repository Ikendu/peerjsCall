export default function () {
  const postDataRef = ref(database, `amountPost`);
  const newPostRef = push(postDataRef);
  if (userName && amount && remoteIdValue) {
    set(newPostRef, {
      userName,
      amount,
      remoteIdValue,
      timestamp: Date.now(),
    })
      .then(() => {
        console.log(`Data posted successfully`);
        //   setUserName(``);
        //   setAmount(``);
        //   setRemoteId(``);
      })
      .catch((e) => {
        console.error(`Error posting data`, e);
      });
  }
}
