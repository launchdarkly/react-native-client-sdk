
Pod::Spec.new do |s|
  s.name         = "LaunchdarklyReactNativeClient"
  s.version      = "1.0.0"
  s.summary      = "LaunchdarklyReactNativeClient"
  s.description  = <<-DESC
                  LaunchdarklyReactNativeClient
                   DESC
  s.homepage     = "https://launchdarkly.com"
  s.license      = "MIT"
  s.license      = { :type => "Apache-2.0", :file => "../LICENSE" }
  s.author       = { "author" => "support@launchdarkly.com" }
  s.platform     = :ios, "9.0"
  s.source       = { :git => "https://github.com/launchdarkly/react-native-client.git", :tag => "master" }
  s.source_files  = "**/*.{h,m,swift}"
  s.swift_version = "4.2"

  s.dependency "React"
  s.dependency "LaunchDarkly", "~> 3.0.0"

end
