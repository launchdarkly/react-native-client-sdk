require 'json'

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = package["name"]
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = { :type => "Apache-2.0", :file => "LICENSE" }
  s.author       = { "author" => "support@launchdarkly.com" }
  s.platform     = :ios, "11.0"
  s.source       = { :git => "https://github.com/launchdarkly/react-native-client-sdk.git", :tag => s.version }
  s.source_files  = "ios/**/*.{h,m,swift}"
  s.swift_version = "5.0"

  s.dependency "React-Core"
  s.dependency "LaunchDarkly", "8.0.0"

end
