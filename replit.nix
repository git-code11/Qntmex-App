
{ pkgs }: {
    deps = [
      pkgs.nodejs-18_x
      pkgs.nodePackages.npm
      pkgs.yarn
      pkgs.esbuild
      pkgs.bash
      pkgs.lsof
    ];
}
