export function CheapGPTAbout() {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-lg font-semibold">
        <span className="bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text text-transparent">
          Thank You
        </span>{" "}
        for Using CheapGPT
      </h2>

      <p className="text-base">
        CheapGPT grows with your interest. If you need more detailed information, please check{" "}
        <a
          href="https://www.webmasters.kr/team/2"
          target="_blank"
          className="text-sky-500 hover:text-sky-600 hover:underline"
        >
          Team CheapGPT
        </a>{" "}
        page.
      </p>
    </div>
  );
}
