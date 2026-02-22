<script>
let { children, submit_text, email_input = $bindable(), password_input = $bindable(), ...form_props } = $props();
</script>

<form class="flex flex-col gap-4 max-w-sm" {...form_props}>
  <div class="flex items-center">
    <div class="w-1/3">
      <label class="block text-gray-500 font-bold text-right mb-1 mb-0 pr-4" for="inline-full-name">
        Email
      </label>
    </div>
    <div class="w-2/3">
      <input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" type="text" placeholder="Email address" bind:this={email_input}>
    </div>
  </div>
  <div class="flex items-center">
    <div class="w-1/3">
      <label class="block text-gray-500 font-bold text-right mb-1 mb-0 pr-4" for="inline-password">
        Password
      </label>
    </div>
    <div class="w-2/3">
      <input
        class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
        id="inline-password"
        type="password"
        placeholder="Password" bind:this={password_input}>
    </div>
  </div>
  <div class="flex flex-col gap-4 items-center">
    <input class="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer" type="submit" value={submit_text} >
    {@render children()}
  </div>
</form>

