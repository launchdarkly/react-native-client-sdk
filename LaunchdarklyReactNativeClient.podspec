
Pod::Spec.new do |s|
  s.name         = "LaunchdarklyReactNativeClient"
  s.version      = "1.0.0-beta.0"
  s.summary      = "LaunchdarklyReactNativeClient"
  s.description  = <<-DESC
                  LaunchdarklyReactNativeClient
                   DESC
  s.homepage     = "https://launchdarkly.com"
  s.license      = "MIT"
  s.license      = { :type => "Apache-2.0", :file => "LICENSE" }
  s.author       = { "author" => "support@launchdarkly.com" }
  s.platform     = :ios, "8.0"
  s.source       = { :git => "https://github.com/launchdarkly/react-native-client.git", :tag => "master" }
  s.source_files  = "ios/**/*.{h,m,swift}"
  s.exclude_files = "android/**/*"
  s.preserve_paths = "package.json"

  s.dependency "React"
  s.dependency "LaunchDarkly", "~> 3.0.0-beta.2"

end
